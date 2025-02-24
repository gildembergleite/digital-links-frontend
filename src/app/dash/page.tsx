'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { LinkService } from "@/service/link-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, ExternalLink, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const linkSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  url: z.string().url({ message: "URL inválida" }),
})

type Link = {
  id: string
  title: string
  url: string
}

export default function SocialLinksManager() {
  const { accessToken } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<Omit<Link, "id">>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  useEffect(() => {
    async function fetchLinks() {
      try {
        const data = await LinkService.list(accessToken)
        setLinks(data)
      } catch {
        toast.error("Erro ao carregar os links")
      }
    }

    fetchLinks()
  }, [])

  async function onSubmit(values: Omit<Link, "id">) {
    try {
      if (editingId) {
        const updatedLink = await LinkService.update(accessToken, editingId, values)
        setLinks((prev) => prev.map((link) => (link.id === editingId ? updatedLink : link)))
        toast.success("Link atualizado com sucesso!")
      } else {
        const newLink = await LinkService.create(accessToken, values)
        setLinks((prev) => [...prev, newLink])
        toast.success("Link adicionado com sucesso!")
      }

      setEditingIndex(null)
      setEditingId(null)
      form.reset()
    } catch {
      toast.error("Erro ao salvar link")
    }
  }

  function editLink(index: number) {
    const linkToEdit = links[index]
    form.setValue("title", linkToEdit.title)
    form.setValue("url", linkToEdit.url)
    setEditingIndex(index)
    setEditingId(linkToEdit.id)
  }

  async function deleteLink(index: number) {
    try {
      await LinkService.delete(accessToken, links[index].id)
      setLinks((prev) => prev.filter((_, i) => i !== index))
      toast.success("Link removido com sucesso!")
    } catch {
      toast.error("Erro ao remover link")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Gerenciador de Links Sociais</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingIndex !== null ? "Editar Link" : "Adicionar Novo Link"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Instagram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {editingIndex !== null ? "Atualizar Link" : "Adicionar Link"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seus Links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum link adicionado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={link.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <div>
                    <h3 className="font-medium">{link.title}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center"
                    >
                      {link.url} <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => editLink(index)}>
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteLink(index)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}