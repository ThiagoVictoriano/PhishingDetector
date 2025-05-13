"use client"

import { useState, type FormEvent } from "react"

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export default function UrlRequestPage() {
  const [url, setUrl] = useState<string>("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (err) {
      setError("Erro ao processar a requisição")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="!flex !items-center !justify-center !min-h-screen !w-full !bg-gray-900 !p-4">
      <div className="!max-w-md !w-full !mx-auto !bg-gray-800 !rounded-lg !shadow-xl !p-8">
        <div className="!text-center">
          <h2 className="!text-3xl !font-bold !text-white !mb-2">Phishing Detector</h2>
          <p className="!text-gray-400 !text-sm !mb-6">Insira uma URL para processá-la através da API</p>
        </div>

        <form className="!space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="url" className="!sr-only">
              URL
            </label>
            <input
              id="url"
              name="url"
              type="text"
              required
              className="!w-full !px-3 !py-2 !bg-gray-700 !border !border-gray-600 !rounded-md !text-white !placeholder-gray-400 focus:!outline-none focus:!ring-2 focus:!ring-emerald-500 focus:!border-emerald-500"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {error && <div className="!text-red-400 !text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="!w-full !flex !justify-center !py-2 !px-4 !border !border-transparent !rounded-md !shadow-sm !text-sm !font-medium !text-white !bg-emerald-600 hover:!bg-emerald-700 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-emerald-500 disabled:!bg-emerald-800 disabled:!opacity-70"
          >
            {loading ? "Processando..." : "Processar URL"}
          </button>
        </form>

        {response && (
          <div className="!mt-8">
            <h3 className="!text-lg !font-medium !text-white !mb-2">Resposta da API:</h3>
            <div className="!p-4 !bg-gray-700 !rounded-md !overflow-auto !max-h-60">
              <pre className="!text-sm !text-gray-300 !font-mono">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
