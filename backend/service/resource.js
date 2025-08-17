const Resource = require('../dataaccess/resource')

const getAll = async () => {
    const resources = await Resource.getAll()
    return resources
}

const getByEventId = async (id) => {
    const resources = await Resource.getByEventId(id)
    return resources
}  

const create = async (body) => {
    const resource = await Resource.create(body)
    return resource
}

const deleteResource = async (id) => {
    const resource = await Resource.deleteResource(id)
    return resource
}

module.exports = {
    getAll,
    getByEventId,
    create,
    deleteResource
}