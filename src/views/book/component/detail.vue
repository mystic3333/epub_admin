<template>
  <div>
    <el-form ref="postForm" :model="postForm" :rules="rules">
      <sticky :class-name="'sub-navbar'">
        <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
        <el-button
          v-loading="loading"
          type="success"
          @click="submitForm"
        >{{ isEdit == true ? '编辑电子书' : '新增电子书' }}</el-button>
      </sticky>
      <div class="detail-container">
        <el-col>
          <warn />

          <el-row :span="24">
            <ebook-upload
              :file-list="fileList"
              :disabled="isEdit"
              @onSuccess="onUploadSuccess"
              @onRemove="onUploadRemove"
            />
          </el-row>
          <el-row :span="24">
            <el-form-item label="书名" prop="title">
              <el-input v-model="postForm.title" />
            </el-form-item>
            <el-form-item label="出版社" prop="publisher">
              <el-input v-model="postForm.publisher" />
            </el-form-item>
            <el-form-item label="语言" prop="language">
              <el-input v-model="postForm.language" />
            </el-form-item>
            <el-form-item label="作者" prop="author">
              <el-input v-model="postForm.author" disabled />
            </el-form-item>
            <el-form-item label="根文件" prop="rootFile">
              <el-input v-model="postForm.rootFile" disabled />
            </el-form-item>
            <el-form-item label="文件路径" prop="filePath">
              <el-input v-model="postForm.filePath" disabled />
            </el-form-item>
            <el-form-item label="解压路径" prop="unzipPath">
              <el-input v-model="postForm.unzipPath" disabled />
            </el-form-item>
            <el-form-item label="封面路径" prop="coverPath">
              <el-input v-model="postForm.cover" disabled />
            </el-form-item>
            <el-form-item label="文件原名" prop="orginalName">
              <el-input v-model="postForm.orginalName" disabled />
            </el-form-item>
            <el-form-item label="文件名称" prop="fileName">
              <el-input v-model="postForm.fileName" disabled />
            </el-form-item>
            <el-form-item label="封面" prop="cover">
              <el-image
                :src="postForm.cover"
                style="width: 100px; height: 150px"
                fit="fill"
              />
            </el-form-item>
            <el-form-item>
              <span>目录</span>
              <el-tree
                :data="postForm.chapterTree"
                @node-click="getContent"
              />
            </el-form-item>
          </el-row>
        </el-col>
      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'
import Warn from './warn'
import EbookUpload from '@/components/EbookUpload'
import { createBook, getBook, updateBook } from '@/api/book'

const mappingVariable = {
  title: '标题',
  publisher: '出版社',
  language: '语言'
}

export default {
  components: {
    Sticky,
    Warn,
    EbookUpload
  },
  props: {
    isEdit: Boolean
  },
  data() {
    const requireValidator = (rule, value, callback) => {
      // console.log(rule, value)
      if (value.length === 0) {
        callback(new Error(mappingVariable[rule['field']] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        title: [{ validator: requireValidator }],
        publisher: [{ validator: requireValidator }],
        language: [{ validator: requireValidator }]
      },
      fileList: [],
      loading: false,
      postForm: {

      }
    }
  },
  created() {
    if (this.isEdit) {
      // console.log('route', this.$route.params.fileName)
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName)
        .then(response => {
          this.setData(response.data[0])
        })
    },
    setDefaultProps() {
      // this.postForm = Object.assign({}, defaultProps)
      this.$refs.postForm.resetFields()
    },
    getContent(data) {
      // console.log('node-click', data)
      if (data.text) {
        console.log('get content', data)
        window.open(data.text)
      }
    },
    setData(data) {
      console.log('formData', data)
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        contents,
        coverPath,
        orginalName,
        chapterTree,
        filePath,
        unzipPath,
        fileName
      } = data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        contents,
        coverPath,
        orginalName,
        chapterTree,
        filePath,
        unzipPath,
        fileName
      }
      this.fileList = [{ name: orginalName }]
    },
    onUploadSuccess(data) {
      console.log('onUploadSuccess', data)
      this.setData(data)
    },
    onUploadRemove() {
      this.fileList = []
      this.setDefaultProps()
    },
    showGuide() {
      console.log('show guide...')
    },
    submitForm() {
      this.$refs.postForm.validate((isValid, inValidFields) => {
        const book = Object.assign({}, this.postForm)
        delete book.chapterTree
        console.log('submitForm', book)
        if (isValid) {
          this.loading = true
          if (this.loading) {
            if (this.isEdit) {
            // 编辑模式 更新 updateBook
              updateBook(book)
                .then(res => {
                  console.log(res)
                  this.$notify({
                    title: '操作成功',
                    message: res.msg,
                    type: 'success',
                    duration: 2000
                  })
                  this.loading = false
                })
                .catch(e => {
                  this.loading = false
                })
            } else {
            // 非编辑模式 新增 createBook
              createBook(book)
                .then(res => {
                  const { msg } = res
                  this.$notify({
                    title: '操作成功',
                    message: msg,
                    type: 'success',
                    duration: 2000
                  })
                  this.onUploadRemove()
                  this.loading = false
                })
                .catch(e => {
                  this.loading = false
                })
            }
          }
        } else {
          const errMsg = inValidFields[Object.keys(inValidFields)[0]][0].message
          console.log(errMsg)
          this.$message({
            message: errMsg,
            type: 'error'
          })
          this.loading = false
        }
        // console.log('submitForm', isValid, inValidFields)
      })
      this.loading = false
    }
  }
}
</script>

<style scoped>
.detail-container {
    padding: 40px 50px 20px;
}
</style>
