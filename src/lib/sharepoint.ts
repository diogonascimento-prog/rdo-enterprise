/**
 * Integração com SharePoint via Microsoft Graph API
 * As fotos são salvas em: /<NomeDaObra>/<YYYY-MM-DD>_<Atividade>/<arquivo>
 */

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  );
  const data = await res.json();
  return data.access_token as string;
}

export type ResultadoUpload = {
  sharepointUrl: string;
  sharepointCaminho: string;
  nomeArquivo: string;
  tamanho: number;
};

/**
 * Faz upload de uma foto para o SharePoint
 * @param arquivo Buffer ou Blob da imagem
 * @param nomeObra Nome da obra (usado na pasta raiz)
 * @param data Data do RDO
 * @param atividade Descrição da atividade (usada no nome da subpasta)
 * @param indice Índice da foto no dia (ex.: 1 → "foto_001.jpg")
 * @param extensao Extensão do arquivo ("jpg" | "png" | "webp")
 */
export async function uploadFotoSharePoint(
  arquivo: Buffer,
  nomeObra: string,
  data: Date,
  atividade: string,
  indice: number,
  extensao: string = "jpg"
): Promise<ResultadoUpload> {
  const token = await getAccessToken();
  const siteId = process.env.SHAREPOINT_SITE_ID!;
  const driveId = process.env.SHAREPOINT_DRIVE_ID!;
  const basePathEnv = process.env.SHAREPOINT_FOTOS_BASE_PATH ?? "/RDO-Fotos";

  // Gera slugs sem acentos
  const slug = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const dataStr = data.toISOString().split("T")[0]; // "2024-06-15"
  const pasta = `${slug(nomeObra)}/${dataStr}_${slug(atividade)}`;
  const nomeArquivo = `foto_${String(indice).padStart(3, "0")}.${extensao}`;
  const caminhoCompleto = `${basePathEnv}/${pasta}/${nomeArquivo}`;

  const uploadUrl = `${GRAPH_BASE}/sites/${siteId}/drives/${driveId}/root:${caminhoCompleto}:/content`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "image/jpeg",
    },
    body: arquivo as unknown as BodyInit,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao fazer upload para o SharePoint: ${err}`);
  }

  const json = await res.json();

  return {
    sharepointUrl: json.webUrl as string,
    sharepointCaminho: pasta,
    nomeArquivo,
    tamanho: arquivo.byteLength,
  };
}
