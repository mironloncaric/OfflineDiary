import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'

import Entries from './Entries'
import './MainApp.css'

export default function MainApp() {
    return (
        <div>
            <Tabs defaultActiveKey="entries" transition={false} id="noanim-tab-example">
                <Tab eventKey="entries" title="Entries">
                    <Entries />
                </Tab>
                <Tab eventKey="charts" title="Charts">
                </Tab>
            </Tabs>
        </div>
    )
}
