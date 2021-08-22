import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'
import { useParams } from 'react-router'


const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]


function TextEditor() {

  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  const { id: documentId } = useParams()


  //create connections
  useEffect(() => {
    const sckt = io('http://localhost:3001')
    setSocket(sckt)
    return () => {
      sckt.disconnect()
    }
  }, [])

  useEffect(() => {
    if(socket == null || quill == null) return

    socket.once('load-document', document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)

  }, [socket, quill, documentId])

  useEffect(() => {
    if(socket == null || quill == null) return

    const Interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return(() => {
      clearInterval(Interval)
    })
  }, [socket, quill])


  //text-change
  useEffect(() => {

    if(socket == null || quill == null) return

    const handler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', handler)

    return(() => {
      socket.off('receive-changes', handler)
    })

  }, [socket, quill])



  //text-change
  useEffect(() => {

    if(socket == null || quill == null) return

    const handler = (delta, olderDelta, source) => {
      if(source !== 'user') return
      socket.emit('send-changes', delta)
    }

    quill.on('text-change', handler)

    return(() => {
      quill.off('text-change', handler)
    })

  }, [socket, quill])




  const quillWrapperRef = useCallback((wrapper) => {

    if(wrapper === null) return
    
    wrapper.innerHTML = ''
    const quillEditor = document.createElement('div')
    wrapper.append(quillEditor)
    const q = new Quill(quillEditor, {theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS }} )
    
    q.disable()
    q.setText('Loading...')
    setQuill(q)

  }, [])
  
  return <div id='container' ref={quillWrapperRef}></div>

}

export default TextEditor