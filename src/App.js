import React from 'react'
import { 
	HashRouter,
	Route,
	Redirect,
	Switch
} from 'react-router-dom'

import MainApp from './components/MainApp'
import Login from './components/Login'
import { PostsContext } from './PostsContext'

const App = () => {

	return (
		<HashRouter>
			<Route exact path="/entries" component={ MainApp }>
			</Route>
			<Route exact path="/" component={ Login }>
			</Route>
		</HashRouter>
	)

}

export default App
