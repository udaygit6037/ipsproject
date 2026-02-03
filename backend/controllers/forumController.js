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
    const { category, search, sortBy, page = 1, limit = 10 } = req.query;

    const query = { isApproved: true };

    if (category && category !== 'all') {
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
    } else if (sortBy === 'replies') {
      sortOption = { isPinned: -1, 'comments': -1, createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ForumPost.countDocuments(query);
    const posts = await ForumPost.find(query)
      .populate('author', 'name role')
      .populate('comments.author', 'name role')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

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
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
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

    const identifier = req.userId || req.anonymousId;

    if (!identifier) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to like a post.'
      });
    }

    const likeIndex = post.likes.indexOf(identifier);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(identifier);
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

// Get forum statistics
export const getForumStats = async (req, res) => {
  try {
    // Count total approved posts
    const totalPosts = await ForumPost.countDocuments({ isApproved: true });

    // Calculate active members (users who have created posts or comments)
    // Get all posts with authors
    const posts = await ForumPost.find({ isApproved: true })
      .select('author comments.author')
      .lean();

    const activeMemberIds = new Set();
    
    posts.forEach(post => {
      // Add post authors (handle both ObjectId and populated object)
      if (post.author) {
        let authorId;
        if (typeof post.author === 'object' && post.author._id) {
          authorId = post.author._id.toString();
        } else if (typeof post.author === 'object' && post.author.toString) {
          authorId = post.author.toString();
        } else {
          authorId = String(post.author);
        }
        if (authorId && authorId !== 'null' && authorId !== 'undefined') {
          activeMemberIds.add(authorId);
        }
      }
      
      // Add comment authors
      if (post.comments && Array.isArray(post.comments)) {
        post.comments.forEach(comment => {
          if (comment.author) {
            let commentAuthorId;
            if (typeof comment.author === 'object' && comment.author._id) {
              commentAuthorId = comment.author._id.toString();
            } else if (typeof comment.author === 'object' && comment.author.toString) {
              commentAuthorId = comment.author.toString();
            } else {
              commentAuthorId = String(comment.author);
            }
            if (commentAuthorId && commentAuthorId !== 'null' && commentAuthorId !== 'undefined') {
              activeMemberIds.add(commentAuthorId);
            }
          }
        });
      }
    });

    const activeMembers = activeMemberIds.size;

    // Count posts created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const postsThisWeek = await ForumPost.countDocuments({
      isApproved: true,
      createdAt: { $gte: oneWeekAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPosts,
          activeMembers,
          postsThisWeek
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forum statistics',
      error: error.message
    });
  }
};
