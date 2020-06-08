<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        class="filter-item"
        placeholder="书名"
        style="width: 200px"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-input
        v-model="listQuery.author"
        class="filter-item"
        placeholder="作者"
        style="width: 200px"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="分类"
        class="filter-item"
        style="width: 200px"
        clearable
        @change="handleFilter"
      >
        <el-option
          v-for="category in categoryList"
          :key="category.value"
          :value="category.value"
          :label="category.label + '(' + category.num + ')'"
        />
      </el-select>
      <el-button
        v-waves
        type="primary"
        class="filter-item"
        icon="el-icon-search"
        style="margin-left:5px"
      >搜索</el-button>
      <el-button
        type="primary"
        class="filter-item"
        icon="el-icon-edit"
        stye="margin-left:5px"
        @click="createBook"
      >新增</el-button>
      <el-checkbox
        v-model="isShowCover"
        type="primary"
        class="filter-item"
        style="margin-left: 10px"
        @change="changeShowCover"
      >显示封面</el-checkbox>
    </div>
    <el-table
      :key="tableKey"
      v-loading="isLoading"
      :default-sort="defaultSort"
      style="width: 100%"
      :data="list"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
    > <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      />

      <el-table-column
        label="title"
        prop="title"
        sortable="custom"
        align="center"
        width="150"
      >
        <template slot-scope="{row: {titleWarpper}}">
          <span v-html="titleWarpper" />
        </template>
      </el-table-column>

      <el-table-column
        label="作者"
        width="150"
        align="center"
      >
        <template slot-scope="{row: {authorWarpper}}">
          <span v-html="authorWarpper" />
        </template>
      </el-table-column>

      <el-table-column
        label="出版社"
        width="150"
        prop="publisher"
        align="center"
      >
        <template slot-scope="{row: {publisher}}">
          <span>{{ publisher }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="分类"
        width="150"
        prop="categoryText"
        align="center"
      />

      <el-table-column
        label="语言"
        prop="language"
        width="100"
        align="center"
      />

      <el-table-column
        v-if="isShowCover"
        label="封面"
        prop="cover"
        width="150"
        align="center"
      >
        <template slot-scope="{row: {cover}}">
          <a :href="cover" target="_blank">
            <img :src="cover" alt="封面图片" style="width: 120px; height: 180px">
          </a>
        </template>
      </el-table-column>

      <el-table-column
        width="100"
        label="文件名"
        prop="fileName"
        align="center"
      />

      <el-table-column
        width="100"
        label="文件路径"
        prop="filePath"
        align="center"
      >
        <template slot-scope="{row: {filePath}}">
          <span>{{ filePath | valueFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="100"
        label="封面路径"
        prop="coverPath"
        align="center"
      />

      <el-table-column
        width="100"
        label="解压路径"
        prop="unzipPath"
        align="center"
      />

      <el-table-column
        width="100"
        label="创建人"
        prop="createUser"
        align="center"
      />

      <el-table-column
        width="100"
        label="上传时间"
        prop="createDt"
        align="center"
      >
        <template slot-scope="{row: {createDt}}">
          <span>{{ createDt | timeFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="100"
        label="更新时间"
        prop="updateDt"
        align="center"
      >
        <template slot-scope="{row: {updateDt}}">
          <span>{{ updateDt | timeFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="{row: {fileName}}">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="editBook(fileName)"
          />
          <el-button
            type="text"
            icon="el-icon-delete"
            style="color: red"
            @click="deleteBook(fileName)"
          />
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
/* eslint-disable */
import Pagination from '../../components/Pagination'
import { getCategory, getListBook, delBook } from '../../api/book'
import waves from '../../directive/waves'
import {parseTime} from '../../utils/index'

export default {
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    valueFilter(value) {
      return value || '空'
    },
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '空'
    }
  },
  data() {
    return {
      defaultSort: {},
      isLoading: true,
      list: [],
      tableKey: 0,
      listQuery: {
      },
      isShowCover: false,
      categoryList: [],
      total: 0
    }
  },
  created() {
    this.parseQuery()
  },
  beforeRouteUpdate(to, from, next) {
    console.log('beforeRouteUpdate',to, from)
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query) 
      if (JSON.stringify(newQuery) != JSON.stringify(oldQuery)) {
        this.listBook()
      }
    }
    next()
  },
  mounted() {
    this.listBook()
    this.getCategoryList()
  },
  methods: {
    deleteBook(fileName) {
      console.log(fileName)
      this.$confirm('你讲永久删除这一本电子书,是否继续?', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        delBook(fileName).then(response => {
          this.$notify({
            title: '操作',
            message: response.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.handleFilter()
        })
      })
    },
    warpperKeyword(k,v) {
      function highLight(value) {
        return `<span style="color:#1890ff">${value}</span>`
      }
      if (!this.listQuery[k]) {
        return v
      } else {
        return v.replace(new RegExp(this.listQuery[k], 'ig'), v => highLight(v))
      }
    },
    parseQuery() {
      let query = Object.assign({}, this.$route.query)
      let sort = '+id'
      let listQuery = {
        page: 1,
        pageSize: 10
      }

      if(query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.size && (query.sort = query.sort)
      }

      const propSymbol = sort[0]
      const orderColumn = sort.slice(1, sort.length)
      this.defaultSort = {
        prop: orderColumn,
        order: propSymbol == '+' ? 'ascending' : 'descending'
      }

      this.listQuery = {...listQuery, ...query}
      console.log('listQuery', listQuery)
    },
    editBook(fileName) {
      this.$router.push('/book/edit/'+fileName)
    },
    listBook() {
      this.isLoading = true
      getListBook(this.listQuery).then(response => {
          console.log('list', response)
        const {list, count, page, pageSize} = response.data
        this.list = list
        this.total = count
        this.isLoading = false

        this.list.forEach(book => {
          book.titleWarpper = this.warpperKeyword('title', book.title)
          book.authorWarpper = this.warpperKeyword('author', book.author)
        })
      })
    },
    sortBy(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else if(order === 'descending'){
        this.listQuery.sort = `-${prop}`
      }
    },
    sortChange(data) {
      console.log('sort change..', data)
      const { prop,  order} = data
      this.sortBy(prop, order)
      this.handleFilter()
    },
    getCategoryList() {
      getCategory().then(category => {
        console.log(category)
        this.categoryList = category.data
      })
    },
    refresh() {
      this.$router.push({
        path: '/book/list',
        query: this.listQuery
      })
      
      
    },
    handleFilter() {
      console.log('handleFilter', this.listQuery)
      this.listQuery.page = 1
      this.refresh()
      // this.listBook()
    },
    createBook() {
      this.$router.push('/book/create')
    },
    changeShowCover(value) {
      this.isShowCover = value
    }
  }
}
</script>

<style scoped>

</style>
