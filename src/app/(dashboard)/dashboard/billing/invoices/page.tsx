'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, ExternalLink, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  currency: string
  status: string
  stripe_invoice_id: string | null
  billing_period_start: string
  billing_period_end: string
  due_date: string
  paid_at: string | null
  created_at: string
  subscription: {
    plan: {
      name: string
      slug: string
    }
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (!invoice.stripe_invoice_id) return

    setDownloadingId(invoice.id)

    try {
      // Open Stripe hosted invoice in new tab
      const stripeInvoiceUrl = `https://invoice.stripe.com/i/acct_${process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID}/${invoice.stripe_invoice_id}`
      window.open(stripeInvoiceUrl, '_blank')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Errore durante il download della fattura')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pagata</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">In attesa</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Fallita</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Fatture</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Storico delle tue fatture e pagamenti
          </p>
        </div>
        <Link href="/dashboard/billing">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Nessuna fattura disponibile
            </p>
            <p className="text-sm text-gray-500">
              Le tue fatture appariranno qui dopo il primo pagamento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Piano: <span className="font-medium">{invoice.subscription.plan.name}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Periodo: {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                    </p>
                    {invoice.paid_at && (
                      <p className="text-sm text-green-600 mt-1">
                        Pagata il {formatDate(invoice.paid_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(invoice.due_date)}
                      </p>
                    </div>

                    {invoice.stripe_invoice_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                        disabled={downloadingId === invoice.id}
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Caricamento...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visualizza
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">💡 Informazioni sulle Fatture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • Le fatture vengono generate automaticamente ad ogni pagamento
          </p>
          <p>
            • Puoi visualizzare e scaricare le fatture cliccando su "Visualizza"
          </p>
          <p>
            • Le fatture pagate sono disponibili immediatamente
          </p>
          <p>
            • Per assistenza sulle fatture, contatta il supporto
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
