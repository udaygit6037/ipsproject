import ForumPost from '../models/ForumPost.js';

export const createPost = async (req, res) => {
  try {
    const { title, content, category, isAnonymous, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and category'
      });
    }

    const post = new ForumPost({
      title,
      content,
      category,
      author: req.userId,
      isAnonymous: isAnonymous || false,
      tags
    });

    await post.save();

    if (!isAnonymous) {
      await post.populate('author', 'name role');
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    const query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { isPinned: -1, createdAt: -1 };
    if (sortBy === 'popular') {
      sortOption = { isPinned: -1, likes: -1, createdAt: -1 };
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name role')
      .populate('comments.author', 'name role')
      .sort(sortOption);

    const postsWithAnonymity = posts.map(post => {
      const postObj = post.toObject();
      if (post.isAnonymous) {
        postObj.author = { name: 'Anonymous', role: 'student' };
      }
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: postsWithAnonymity.length,
      data: { posts: postsWithAnonymity }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role')
      .populate('comments.author', 'name role');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const postObj = post.toObject();
    if (post.isAnonymous && post.author._id.toString() !== req.userId) {
      postObj.author = { name: 'Anonymous', role: 'student' };
    }

    res.status(200).json({
      success: true,
      data: { post: postObj }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;

    await post.save();
    await post.populate('author', 'name role');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await ForumPost.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: { likesCount: post.likes.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      author: req.userId,
      content
    });

    await post.save();
    await post.populate('comments.author', 'name role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comments: post.comments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};
