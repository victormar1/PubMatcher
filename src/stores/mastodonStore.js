import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import moment from 'moment'

export const useMastodonStore = defineStore('mastodon', () => {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const newPostsCount = ref(0)
  const showFeed = ref(false)
  const lastViewedTimestamp = ref(Date.now())
  const maintenanceMessage = ref(null)
  let pollingIntervalId = null

  const formattedPosts = computed(() => {
    return posts.value.map((post) => ({
      ...post,
      formattedDate: moment(post.createdAt).fromNow()
    }))
  })

  const fetchPosts = async (limit = 30, excludeReplies = true) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/api/mastodon/timeline', {
        params: { limit, excludeReplies }
      })

      let rawPosts = data.map((p) => ({
        id: p.id,
        displayName: p.account.display_name || p.account.username,
        username: p.account.username,
        avatar: p.account.avatar,
        content: p.content,
        createdAt: p.created_at,
        url: p.url,
        repliesCount: p.replies_count,
        reblogsCount: p.reblogs_count,
        favouritesCount: p.favourites_count,
        media: p.media_attachments || []
      }))

      if (rawPosts.length > 0 && rawPosts[0].content.startsWith('<p>!Maintenance')) {
        console.log(rawPosts[0].content)
        maintenanceMessage.value = rawPosts[0].content
      }

      const regularPosts = []
      for (const post of rawPosts) {
        if (!post.content.startsWith('<p>!Maintenance')) {
          regularPosts.push(post)
        }
      }
      posts.value = regularPosts

      if (!showFeed.value) {
        const oneWeekAgo = moment().subtract(7, 'days')
        newPostsCount.value = posts.value.filter((post) => moment(post.createdAt).isAfter(oneWeekAgo)).length
      }

      return posts.value
    } catch (e) {
      console.error(e)
      error.value = 'Failed to load updates. Please try again later.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const toggleFeed = () => {
    showFeed.value = !showFeed.value
    if (showFeed.value) {
      newPostsCount.value = 0
      lastViewedTimestamp.value = Date.now()
    }
  }

  const resetNewPostsCount = () => {
    newPostsCount.value = 0
    lastViewedTimestamp.value = Date.now()
  }

  const setupPolling = (intervalSeconds = 60) => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId)
    }
    pollingIntervalId = setInterval(() => {
      fetchPosts()
    }, intervalSeconds * 1000)
  }

  const stopPolling = () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId)
      pollingIntervalId = null
    }
  }

  fetchPosts()
  setupPolling(300)

  return {
    posts,
    loading,
    error,
    newPostsCount,
    showFeed,
    maintenanceMessage,

    formattedPosts,

    fetchPosts,
    toggleFeed,
    resetNewPostsCount,
    stopPolling
  }
})
