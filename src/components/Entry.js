import React from 'react'
import { Toast, InputGroup } from 'react-bootstrap'

import './Entry.css'

export default function Entry(props) {
    var color = ''
    if(props.emoji === '😀') color = 'yellow'
    if(props.emoji === '😍') color = 'red'
    if(props.emoji === '🤮') color = 'green'
    if(props.emoji === '😎') color = 'gray'
    if(props.emoji === '😢') color = 'blue'
    return (
        <Toast className="width-100 line-break">
            <InputGroup.Text className={ color }>
                <strong className="mr-auto">Dear Diary,</strong>
                <small>{ props.date }</small>
                &nbsp;&nbsp;
                <small>{ props.emoji }</small>
            </InputGroup.Text>
            <Toast.Body>{ props.text }</Toast.Body>
        </Toast>
    )
}
