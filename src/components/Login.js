import React, { useEffect, useState } from 'react'
import { Button, Form, Alert } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import { useHistory } from 'react-router-dom'

export default function Login() {

    const history = useHistory()

    const [pwExists, setPwExists] = useState()
    const [pwd, setPwd] = useState()
    const [name, setName] = useState('')
    const [size, setSize] = useState('')

    const [error, setError] = useState('')
    const [warning, setWarning] = useState('')

    const messeges = {
        margin:'0 auto', 
        marginTop:'20px', 
        width:'70%', 
        textAlign:'center'
    }

    useEffect(() => {
        ipcRenderer.on('pw-exists', (event, arg) => {
            if (arg === true) { 
                setPwExists(true)
                setSize('small')
            }
            else { 
                setPwExists(false)
                setSize('large')
            }
        })
        ipcRenderer.on('check-pw', (event, arg) => {
            console.log(arg)
            if(arg === true) {
                history.push('entries')
            } else {
                setError('Pogrešna lozinka')
            }
        })
        ipcRenderer.on('set-pw', (event, arg) => {
            if(arg === 'success') {
                history.push('entries')
            }
        })
        ipcRenderer.send('pw-exists', 'ping')
    }, [])

    const handleSubmit = () => {
        if(pwd !== '') {
            if(pwExists !== true) {
                ipcRenderer.send('set-pw', { pwd, name })
            }
            else {
                ipcRenderer.send('check-pw', pwd)
            }
        }
    }

    return (
        <>
            {
                (error !== '') &&
                <Alert style={ messeges } 
                    variant="danger">
                    { error }
                </Alert>
            }
            {
                (warning !== '') &&
                <Alert style={ messeges } 
                    variant="warning">
                    { warning }
                </Alert>
            }
            <div className="login">
                <div className={`child ${size}`}>
                    <h4 style={{ textAlign:'center' }}>{ pwExists ? 'Dobrodošli natrag!' : 'Dobrodošli!' }</h4>
                    <small>{ !pwExists && 'Upišite lozinku kojom ćete pristupiti svom dnevniku' }</small>
                    {
                        !pwExists &&
                        <Form.Control 
                            type="text" 
                            placeholder="Ime" 
                            onChange={e => {
                                setName(e.target.value)
                                if(e.target.value === '') {
                                    setError('')
                                    setWarning('Ime ne može biti prazno')
                                } else {
                                    setWarning('')
                                }
                            }}
                            style={{
                                margin:'10px 0'
                            }}
                        />
                    }
                    <Form.Control 
                        type="password" 
                        placeholder="Lozinka" 
                        onChange={e => {
                            setPwd(e.target.value)
                            if(e.target.value === '') {
                                setError('')
                                setWarning('Lozinka ne može biti prazna')
                            } else {
                                setWarning('')
                            }
                        }}
                    />
                    <Button 
                        block 
                        onClick={ handleSubmit } 
                        variant="info"
                        style={{ marginTop:'10px' }}
                    >Potvrdi</Button>
                </div>
            </div>
        </>
    )
}
