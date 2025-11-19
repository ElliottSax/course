'use client'

import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI teaching assistant. Ask me anything about your courses, concepts you're learning, or get help with exercises!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">AI Teaching Assistant</h1>
        <p className="text-muted-foreground">
          Get instant help with your coursework, concepts, and questions
        </p>
      </div>

      <Card className="flex h-[600px] flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-secondary">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted px-4 py-2">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Suggested Questions */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Suggested Questions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "What's the difference between let and const?",
            'How do React hooks work?',
            'Explain closures in JavaScript',
            'What are REST API best practices?',
          ].map((question, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setInput(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
