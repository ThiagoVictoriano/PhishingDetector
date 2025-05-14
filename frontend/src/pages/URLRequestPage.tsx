"use client"

import { useState, type FormEvent } from "react"
import {
  AlertTriangle,
  BadgeIcon as Certificate,
  ExternalLink,
  FileText,
  Globe,
  Info,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react"

interface DomainAge {
  age_days: number
  creation_date: string
  is_suspicious: boolean
}

interface SslInfo {
  issuer: string
  expiry_date: string
  matches_domain: boolean
  is_expired: boolean
  is_suspicious: boolean
}

interface Redirect {
  from: string
  to: string
}

interface Redirects {
  redirects: Redirect[]
  count: number
  is_suspicious: boolean
}

interface BrandSimilarity {
  similarities: any[]
  is_suspicious: boolean
}

interface ContentAnalysis {
  has_login_form: boolean
  sensitive_keywords: string[]
  is_suspicious: boolean
}

interface ApiResponse {
  url?: string
  domain?: string
  is_in_openphish?: boolean
  has_number_substitution?: boolean
  has_special_characters?: boolean
  domain_age?: DomainAge
  uses_dynamic_dns?: boolean
  ssl_info?: SslInfo
  redirects?: Redirects
  brand_similarity?: BrandSimilarity
  content_analysis?: ContentAnalysis
  success?: boolean
  data?: any
  error?: string
}

// Remover o enum SecurityLevel e substituir por:
const SecurityLevel = {
  SECURE: "Totalmente Seguro",
  POSSIBLY_INSECURE: "Parcialmente Seguro",
  INSECURE: "Não Seguro",
} as const

type SecurityLevelType = (typeof SecurityLevel)[keyof typeof SecurityLevel]

export default function UrlRequestPage() {
  const [url, setUrl] = useState<string>("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError("Por favor, insira uma URL")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await fetch("/api/checkurl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await result.json()
      setResponse(data)
      setActiveTab("overview")
    } catch (err) {
      setError("Erro ao processar a requisição")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Conta o número de características suspeitas
  const countSuspiciousFeatures = () => {
    if (!response) return 0

    let count = 0
    if (response.is_in_openphish) count++
    if (response.has_number_substitution) count++
    if (response.has_special_characters) count++
    if (response.domain_age?.is_suspicious) count++
    if (response.uses_dynamic_dns) count++
    if (response.ssl_info?.is_suspicious) count++
    if (response.redirects?.is_suspicious) count++
    if (response.brand_similarity?.is_suspicious) count++
    if (response.content_analysis?.is_suspicious) count++

    return count
  }

  // Então, atualizar a função getSecurityLevel para retornar o tipo correto:
  // Determina o nível de segurança baseado no número de características suspeitas
  const getSecurityLevel = (): SecurityLevelType => {
    const suspiciousCount = countSuspiciousFeatures()

    if (suspiciousCount === 0) {
      return SecurityLevel.SECURE
    } else if (suspiciousCount <= 2) {
      return SecurityLevel.POSSIBLY_INSECURE
    } else {
      return SecurityLevel.INSECURE
    }
  }

  // Retorna a cor baseada no nível de segurança
  const getSecurityColor = () => {
    const level = getSecurityLevel()

    switch (level) {
      case SecurityLevel.SECURE:
        return "text-green-500"
      case SecurityLevel.POSSIBLY_INSECURE:
        return "text-yellow-500"
      case SecurityLevel.INSECURE:
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  // Retorna a cor de fundo baseada no nível de segurança
  const getSecurityBgColor = () => {
    const level = getSecurityLevel()

    switch (level) {
      case SecurityLevel.SECURE:
        return "bg-green-900/30"
      case SecurityLevel.POSSIBLY_INSECURE:
        return "bg-yellow-900/30"
      case SecurityLevel.INSECURE:
        return "bg-red-900/30"
      default:
        return "bg-gray-800"
    }
  }

  // Retorna o ícone baseado no nível de segurança
  const getSecurityIcon = () => {
    const level = getSecurityLevel()

    switch (level) {
      case SecurityLevel.SECURE:
        return <ShieldCheck className="h-5 w-5 text-green-500" />
      case SecurityLevel.POSSIBLY_INSECURE:
        return <ShieldQuestion className="h-5 w-5 text-yellow-500" />
      case SecurityLevel.INSECURE:
        return <ShieldAlert className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  // Calcula a porcentagem de segurança
  const calculateSecurityScore = () => {
    if (!response) return 0

    const totalChecks = 9 // Total de verificações realizadas
    const suspiciousCount = countSuspiciousFeatures()
    const safeCount = totalChecks - suspiciousCount

    return Math.round((safeCount / totalChecks) * 100)
  }

  // Renderiza o indicador de status para cada característica
  const renderStatusIndicator = (isSecure: boolean | undefined) => {
    if (isSecure === undefined) return null

    return isSecure ? (
      <ShieldCheck className="h-5 w-5 text-green-500" />
    ) : (
      <ShieldAlert className="h-5 w-5 text-red-500" />
    )
  }

  // Renderiza o conteúdo da aba ativa
  const renderTabContent = () => {
    if (!response) return null

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Score de Segurança</h3>
                <div className="flex items-center justify-center">
                  <div className={`text-5xl font-bold ${getSecurityColor()}`}>{calculateSecurityScore()}%</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Características Suspeitas</h3>
                <div className="flex items-center justify-center">
                  <div
                    className={`text-5xl font-bold ${countSuspiciousFeatures() > 0 ? (countSuspiciousFeatures() <= 2 ? "text-yellow-500" : "text-red-500") : "text-green-500"}`}
                  >
                    {countSuspiciousFeatures()}/9
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Resumo da Análise</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">URL</span>
                  <span className="text-white font-medium">{response.url}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Domínio</span>
                  <span className="text-white font-medium">{response.domain}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-medium ${getSecurityColor()}`}>{getSecurityLevel()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Distribuição de Riscos</h3>
              <div className="space-y-3">
                {response.is_in_openphish !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Presente em OpenPhish</span>
                    {renderStatusIndicator(!response.is_in_openphish)}
                  </div>
                )}
                {response.has_number_substitution !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Substituição por Números</span>
                    {renderStatusIndicator(!response.has_number_substitution)}
                  </div>
                )}
                {response.has_special_characters !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Caracteres Especiais</span>
                    {renderStatusIndicator(!response.has_special_characters)}
                  </div>
                )}
                {response.domain_age && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Idade do Domínio</span>
                    {renderStatusIndicator(!response.domain_age.is_suspicious)}
                  </div>
                )}
                {response.uses_dynamic_dns !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">DNS Dinâmico</span>
                    {renderStatusIndicator(!response.uses_dynamic_dns)}
                  </div>
                )}
                {response.ssl_info && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Certificado SSL</span>
                    {renderStatusIndicator(!response.ssl_info.is_suspicious)}
                  </div>
                )}
                {response.redirects && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Redirecionamentos</span>
                    {renderStatusIndicator(!response.redirects.is_suspicious)}
                  </div>
                )}
                {response.brand_similarity && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Similaridade com Marcas</span>
                    {renderStatusIndicator(!response.brand_similarity.is_suspicious)}
                  </div>
                )}
                {response.content_analysis && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Análise de Conteúdo</span>
                    {renderStatusIndicator(!response.content_analysis.is_suspicious)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "domain":
        return (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Globe className="h-5 w-5 text-emerald-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Informações do Domínio</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Domínio</span>
                  <span className="text-white font-medium">{response.domain}</span>
                </div>
                {response.domain_age && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Data de Criação</span>
                      <span className="text-white font-medium">{response.domain_age.creation_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Idade (dias)</span>
                      <span className="text-white font-medium">{response.domain_age.age_days}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status</span>
                      <span
                        className={`font-medium ${response.domain_age.is_suspicious ? "text-red-500" : "text-green-500"}`}
                      >
                        {response.domain_age.is_suspicious ? "Suspeito" : "Seguro"}
                      </span>
                    </div>
                  </>
                )}
                {response.uses_dynamic_dns !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Usa DNS Dinâmico</span>
                    <span className={`font-medium ${response.uses_dynamic_dns ? "text-red-500" : "text-green-500"}`}>
                      {response.uses_dynamic_dns ? "Sim" : "Não"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Por que isso é importante?</h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-1">Idade do Domínio</h4>
                  <p className="text-sm">
                    Domínios recém-criados (menos de 6 meses) são frequentemente usados em ataques de phishing, pois os
                    atacantes registram novos domínios para suas campanhas maliciosas. Um domínio mais antigo tende a
                    ser mais confiável, embora não seja uma garantia absoluta.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">DNS Dinâmico</h4>
                  <p className="text-sm">
                    Serviços de DNS dinâmico (como no-ip, dyndns) permitem associar um nome de domínio a um endereço IP
                    que muda frequentemente. Embora tenham usos legítimos, são frequentemente utilizados por atacantes
                    para hospedar sites maliciosos temporários que podem mudar rapidamente de localização para evitar
                    detecção.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "ssl":
        return (
          <div className="space-y-4">
            {response.ssl_info && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Certificate className="h-5 w-5 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Informações do Certificado SSL</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Emissor</span>
                    <span className="text-white font-medium">{response.ssl_info.issuer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Data de Expiração</span>
                    <span className="text-white font-medium">{response.ssl_info.expiry_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Corresponde ao Domínio</span>
                    <span
                      className={`font-medium ${response.ssl_info.matches_domain ? "text-green-500" : "text-red-500"}`}
                    >
                      {response.ssl_info.matches_domain ? "Sim" : "Não"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Expirado</span>
                    <span className={`font-medium ${response.ssl_info.is_expired ? "text-red-500" : "text-green-500"}`}>
                      {response.ssl_info.is_expired ? "Sim" : "Não"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span
                      className={`font-medium ${response.ssl_info.is_suspicious ? "text-red-500" : "text-green-500"}`}
                    >
                      {response.ssl_info.is_suspicious ? "Suspeito" : "Seguro"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Por que isso é importante?</h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-1">Certificado SSL</h4>
                  <p className="text-sm">
                    Certificados SSL estabelecem uma conexão segura entre o navegador e o servidor. Sites legítimos
                    geralmente têm certificados válidos emitidos por autoridades certificadoras confiáveis. Certificados
                    expirados, auto-assinados ou que não correspondem ao domínio são sinais de alerta.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Emissor do Certificado</h4>
                  <p className="text-sm">
                    Certificados emitidos por autoridades certificadoras desconhecidas ou menos confiáveis podem indicar
                    um site potencialmente malicioso. Grandes empresas e sites legítimos geralmente usam certificados de
                    autoridades bem estabelecidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "redirects":
        return (
          <div className="space-y-4">
            {response.redirects && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <ExternalLink className="h-5 w-5 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Análise de Redirecionamentos</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Número de Redirecionamentos</span>
                    <span className="text-white font-medium">{response.redirects.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span
                      className={`font-medium ${response.redirects.is_suspicious ? "text-red-500" : "text-green-500"}`}
                    >
                      {response.redirects.is_suspicious ? "Suspeito" : "Seguro"}
                    </span>
                  </div>

                  {response.redirects.redirects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">Cadeia de Redirecionamentos:</h4>
                      <div className="bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto">
                        {response.redirects.redirects.map((redirect, index) => (
                          <div key={index} className="flex flex-col mb-2 last:mb-0">
                            <span className="text-gray-400 text-sm">De: {redirect.from}</span>
                            <div className="flex items-center">
                              <span className="text-gray-400 ml-4 mr-2">→</span>
                              <span className="text-emerald-400 text-sm">Para: {redirect.to}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Por que isso é importante?</h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-1">Redirecionamentos</h4>
                  <p className="text-sm">
                    Redirecionamentos excessivos ou para domínios suspeitos são técnicas comuns em ataques de phishing.
                    Os atacantes podem usar uma URL inicial aparentemente legítima que redireciona o usuário para um
                    site malicioso. Múltiplos redirecionamentos podem ser usados para dificultar a detecção do destino
                    final.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Redirecionamentos entre Domínios</h4>
                  <p className="text-sm">
                    Redirecionamentos que levam a domínios completamente diferentes do original são particularmente
                    suspeitos. Sites legítimos geralmente redirecionam dentro do mesmo domínio ou para domínios
                    claramente relacionados à mesma organização.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "content":
        return (
          <div className="space-y-4">
            {response.content_analysis && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Análise de Conteúdo</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Possui Formulário de Login</span>
                    <span
                      className={`font-medium ${response.content_analysis.has_login_form ? "text-yellow-500" : "text-green-500"}`}
                    >
                      {response.content_analysis.has_login_form ? "Sim" : "Não"}
                    </span>
                  </div>

                  {response.content_analysis.sensitive_keywords.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Palavras-chave Sensíveis</span>
                        <span className="text-yellow-500 font-medium">
                          {response.content_analysis.sensitive_keywords.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {response.content_analysis.sensitive_keywords.map((keyword, index) => (
                          <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span
                      className={`font-medium ${response.content_analysis.is_suspicious ? "text-red-500" : "text-green-500"}`}
                    >
                      {response.content_analysis.is_suspicious ? "Suspeito" : "Seguro"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {response.brand_similarity && (
              <div className="bg-gray-800 p-4 rounded-lg mt-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Similaridade com Marcas</h3>
                </div>
                <div className="space-y-3">
                  {response.brand_similarity.similarities.length > 0 ? (
                    <div>
                      <h4 className="text-white font-medium mb-2">Marcas similares detectadas:</h4>
                      <div className="bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto">
                        {response.brand_similarity.similarities.map((similarity, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <span className="text-gray-300">{similarity.brand}: </span>
                            <span className="text-yellow-400">{similarity.score}% similar</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300">Nenhuma similaridade com marcas conhecidas detectada.</div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span
                      className={`font-medium ${response.brand_similarity.is_suspicious ? "text-red-500" : "text-green-500"}`}
                    >
                      {response.brand_similarity.is_suspicious ? "Suspeito" : "Seguro"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Por que isso é importante?</h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-1">Análise de Conteúdo</h4>
                  <p className="text-sm">
                    Sites de phishing frequentemente contêm formulários de login e solicitam informações sensíveis como
                    senhas, números de cartão de crédito ou dados pessoais. A presença desses elementos, especialmente
                    em sites recém-criados ou com outras características suspeitas, é um forte indicador de phishing.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Similaridade com Marcas</h4>
                  <p className="text-sm">
                    Atacantes frequentemente criam domínios que se parecem com marcas conhecidas (ex: "g00gle.com" em
                    vez de "google.com"). A análise de similaridade usando distância de Levenshtein ajuda a identificar
                    tentativas de typosquatting e imitação de marcas legítimas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "raw":
        return (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Dados Brutos da API</h3>
            <div className="bg-gray-900 p-4 rounded-md overflow-auto max-h-[500px]">
              <pre className="text-sm text-gray-300 font-mono">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-900">
      {/* Sidebar com formulário */}
      <div className="w-full md:w-80 bg-gray-800 p-6 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Phishing Detector</h2>
          <p className="text-gray-400 text-sm">Verifique a segurança de qualquer URL</p>
        </div>

        <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
              URL para análise
            </label>
            <input
              id="url"
              name="url"
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-800 disabled:opacity-70"
          >
            {loading ? "Analisando..." : "Analisar URL"}
          </button>
        </form>

        {response && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center mb-2">
              <Lock className="h-5 w-5 mr-2 text-emerald-500" />
              <h3 className="text-lg font-medium text-white">Resultado</h3>
            </div>
            <div className={`p-3 rounded-md flex items-center justify-between ${getSecurityBgColor()}`}>
              <span className="text-sm font-medium">Status de Segurança</span>
              <div className="flex items-center">
                {getSecurityIcon()}
                <span className={`text-sm font-bold ml-1.5 ${getSecurityColor()}`}>{getSecurityLevel()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6">
        {!response ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md">
              <Globe className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Phishing Detector</h2>
              <p className="text-gray-400">
                Insira uma URL no formulário à esquerda para analisar sua segurança e obter informações detalhadas sobre
                possíveis ameaças.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Análise de Segurança: {response.domain}</h2>

            {/* Tabs de navegação */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "overview" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab("domain")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "domain" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Domínio
                </button>
                <button
                  onClick={() => setActiveTab("ssl")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "ssl" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  SSL
                </button>
                <button
                  onClick={() => setActiveTab("redirects")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "redirects" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Redirecionamentos
                </button>
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "content" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Conteúdo
                </button>
                <button
                  onClick={() => setActiveTab("raw")}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${activeTab === "raw" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
                >
                  Dados Brutos
                </button>
              </nav>
            </div>

            {/* Conteúdo da aba ativa */}
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  )
}
