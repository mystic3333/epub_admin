import request from '../utils/request'

function createBook(book) {
  return request({
    url: '/book/create',
    method: 'post',
    data: book
  })
}

function getBook(fileName) {
  return request({
    url: '/book/get',
    method: 'get',
    params: { fileName }
  })
}

function updateBook(book) {
  return request({
    url: '/book/update',
    method: 'post',
    data: book
  })
}

function getCategory() {
  return request({
    url: '/book/category',
    method: 'get'
  })
}

function getListBook(params) {
  return request({
    url: '/book/list',
    method: 'get',
    params
  })
}

function delBook(fileName) {
  return request({
    url: '/book/del',
    method: 'get',
    params: { fileName }
  })
}

module.exports = {
  createBook,
  getBook,
  updateBook,
  getCategory,
  getListBook,
  delBook
}
