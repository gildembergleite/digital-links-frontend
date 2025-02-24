"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, ExternalLink, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const linkSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  url: z.string().url({ message: "URL inválida" }),
})

type Link = z.infer<typeof linkSchema>

export default function SocialLinksManager() {
  const [links, setLinks] = useState<Link[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const form = useForm<Link>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  function onSubmit(values: Link) {
    if (editingIndex !== null) {
      const updatedLinks = [...links]
      updatedLinks[editingIndex] = values
      setLinks(updatedLinks)
      setEditingIndex(null)
    } else {
      setLinks([...links, values])
    }
    form.reset()
  }

  function editLink(index: number) {
    const linkToEdit = links[index]
    form.setValue("title", linkToEdit.title)
    form.setValue("url", linkToEdit.url)
    setEditingIndex(index)
  }

  function deleteLink(index: number) {
    const updatedLinks = links.filter((_, i) => i !== index)
    setLinks(updatedLinks)
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
                <li key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
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

      {links.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Visualização do Linktree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white text-center mb-4">Seus Links</h2>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-white text-center rounded-md shadow hover:bg-gray-100 transition duration-300"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

