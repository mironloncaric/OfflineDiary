import { ipcRenderer } from 'electron'
import { Button, Form, InputGroup, Alert } from 'react-bootstrap'

import React, { useState, useEffect } from 'react'
import Entry from './Entry'

export default function Entries() {

	useEffect(() => {
		console.log('hello')
		ipcRenderer.on('handle-load-entries', handleLoadData)
	}, [])
	useEffect(() => {
		ipcRenderer.send('load-entries', 'ping')
	}, [])

	const [text, setText] = useState('')
	const [entries, setEntries] = useState([])
	const [emoji, setEmoji] = useState('😀')
	const [nEntries, setNEntries] = useState(5)

	const handleSubmit = e => {
		if(text != '') {
			ipcRenderer.send('new-entry', { content:text, emoji:emoji })
			setText('')
		}
	}
	const handleLoadData = (event, data) => {
		data.sort((a, b) => {
			return b.time - a.time
		})
		setEntries(data)
	}
	const handleClick = e => {
		e.preventDefault()
		ipcRenderer.send('load-entries', 'ping')
	}

    return (
        <div className="app">
			<InputGroup.Text className="w-80 no-margin dear-diary">
				Dear Diary,
			</InputGroup.Text>
			<Form.Control 
				as="select" 
				className="w-20 no-margin"
				value={ emoji }
				onChange={e => setEmoji(e.target.value)}
			>
				<option>😀</option>
				<option>😍</option>
				<option>🤮</option>
				<option>😎</option>
				<option>😢</option>
			</Form.Control>
			<Form.Control 
				className="width-100"
				as="textarea"
				rows={ 6 } 
				value={ text }
				onChange={e => {
					setText(e.target.value)
				}}
				className="textarea"
			/>
			<Button 
				className="submit" 
				onClick={ handleSubmit }
				variant="info"
			>Submit</Button>
			<div
				style={{
					height:'auto',
					marginBottom:'100px'
				}}
			>
				{
					entries.slice(0, nEntries).map((entry, id) => (
						<Entry
							date={ entry.date }
							text={ entry.text }
							key={ id }
							emoji={ entry.emoji }
						/>
					))
				}
				{
					(entries.length > 5) &&
					<Alert 
						variant="info"
						style={{
							textAlign:'center'
						}}
					>
						{
							(entries.length > nEntries) ?
							<Alert.Link
								onClick={() => {
									setNEntries(nEntries+5)
								}}
							>Učitaj više</Alert.Link>
							:
							<b>Nema više stranica za učitati</b>
						}
					</Alert>
				}
			</div>
        </div>
    )
}
