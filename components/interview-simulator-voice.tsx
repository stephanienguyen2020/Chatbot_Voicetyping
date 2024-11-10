'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff } from 'lucide-react'

type Message = {
  role: 'interviewer' | 'interviewee'
  content: string
}

type InterviewState = 'initial' | 'in_progress' | 'redirecting' | 'follow_up'

export function InterviewSimulatorVoice() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'interviewer', content: "Welcome to your Google technical interview simulation. Let's begin with a database-related question. Given a large table of user data, how would you efficiently find the top 10 users with the most friends?" }
  ])
  const [input, setInput] = useState('')
  const [interviewState, setInterviewState] = useState<InterviewState>('initial')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setInput(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'interviewee', content: input }]
    setMessages(newMessages)
    setInput('')

    // Simulate interviewer's response
    setTimeout(() => {
      let interviewerResponse = ''
      switch (interviewState) {
        case 'initial':
          if (input.toLowerCase().includes('index') && input.toLowerCase().includes('order by')) {
            interviewerResponse = "Good start! You're thinking about indexing and sorting. Can you elaborate on the specific SQL query you'd use?"
            setInterviewState('in_progress')
          } else {
            interviewerResponse = "Interesting approach. Have you considered how we might optimize the query performance for such a large dataset?"
            setInterviewState('redirecting')
          }
          break
        case 'in_progress':
          if (input.toLowerCase().includes('select') && input.toLowerCase().includes('limit 10')) {
            interviewerResponse = "Excellent! Now, let's consider scalability. How would your solution perform if the user table had billions of records?"
            setInterviewState('follow_up')
          } else {
            interviewerResponse = "You're on the right track with the SQL query. Is there a way to ensure we're only getting the top 10 results?"
          }
          break
        case 'redirecting':
          interviewerResponse = "Let's take a step back. In SQL, how would you typically retrieve a limited number of rows in descending order?"
          setInterviewState('in_progress')
          break
        case 'follow_up':
          interviewerResponse = "Great discussion! As a final challenge, how would you modify your solution if we needed to update this top 10 list in real-time as friend counts change?"
          break
        default:
          interviewerResponse = "Interesting point. Could you elaborate on that?"
      }
      setMessages([...newMessages, { role: 'interviewer', content: interviewerResponse }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'interviewer' ? 'text-blue-600' : 'text-green-600'}`}>
            <strong>{message.role === 'interviewer' ? 'Interviewer: ' : 'You: '}</strong>
            {message.content}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type or speak your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
          <Button 
            type="button" 
            onClick={toggleListening}
            variant={isListening ? "destructive" : "secondary"}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}