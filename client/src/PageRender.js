import React from 'react'
import { useParams } from 'react-router-dom'
import NotFound from './components/NotFound'

const generatePage = (pageNam) => {
    const component = () => require(`./pages/${pageNam}`).default

    try {
        return React.createElement(component())
        
    } catch (err) {
        return <NotFound />
    }

}

const PageRender = () => {
    const { page, id } = useParams()
    let pageNam = ""

    if (id) {
        pageNam = `${page}/[id]`
    } else {
        pageNam = `${page}`

    }

    return generatePage(pageNam)

}

export default PageRender