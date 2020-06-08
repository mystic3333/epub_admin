<template>
  <div class="upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :before-upload="beforeUpload"
      :multiple="false"
      :limit="1"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="fileList"
      :on-exceed="onExceed"
      :disabled="disabled"
      drag
      show-file-list
      accept="application/epub+zip"
      class="image-upload"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length <= 0" class="el-upload__text">拖拽电子书或者 <em>点击上传</em></div>
      <div v-else class="el-upload__text">图书已上传</div>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth.js'
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    fileList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      action: `${process.env.VUE_APP_BASE_API}/book/upload`
    }
  },
  computed: {
    headers() {
      return {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
  methods: {
    beforeUpload(file) {
      this.$emit('beforeUpload', file)
      console.log(file)
    },
    onSuccess(res, file) {
      console.log(res, file)
      const { msg, code, data } = res
      if (code === 0) {
        this.$message({
          message: msg || '上传成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: (msg && `上传失败原因: ${msg}`) || '上传失败',
          type: 'error'
        })
      }
      this.$emit('onSuccess', data)
    },
    onError(err) {
      console.log({ err })
      const errMsg = err && JSON.parse(err.message)
      this.$message({
        message: errMsg.msg && `上传失败, 失败原因: ${errMsg.msg}` || '上传失败',
        type: 'error'
      })
      this.$emit('onError', err)
    },
    onExceed() {
      this.$message({
        message: '一次只能上传一本电子书',
        type: 'warning'
      })
    },
    onRemove() {
      this.$message({
        message: '电子书取消成功',
        type: 'warning'
      })
      this.$emit('onRemove')
    }

  }
}
</script>
