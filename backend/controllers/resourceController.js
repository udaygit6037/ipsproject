import Resource from '../models/Resource.js';
import upload from '../config/cloudinary.js';
import { getFileInfo, deleteFromCloudinary } from '../config/cloudinary.js';

export const createResource = async (req, res) => {
  try {
    const { title, description, category, tags, url, content } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    const resourceData = {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      url,
      content,
      uploadedBy: req.userId
    };

    // Add file information if file was uploaded
    if (req.file) {
      const fileInfo = getFileInfo(req.file);
      resourceData.fileUrl = fileInfo.fileUrl;
      resourceData.fileName = fileInfo.fileName;
      resourceData.fileSize = fileInfo.fileSize;
      resourceData.cloudinaryId = fileInfo.cloudinaryId;
      resourceData.fileType = fileInfo.fileType;
    }

    const resource = new Resource(resourceData);
    await resource.save();
    await resource.populate('uploadedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message
    });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const { category, tags, search } = req.query;

    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email role');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.views += 1;
    await resource.save();

    res.status(200).json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: error.message
    });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { title, description, category, tags, url, content, isPublished } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (
      resource.uploadedBy.toString() !== req.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own resources'
      });
    }

    if (title) resource.title = title;
    if (description) resource.description = description;
    if (category) resource.category = category;
    if (tags) resource.tags = tags;
    if (url) resource.url = url;
    if (content) resource.content = content;
    if (typeof isPublished !== 'undefined') resource.isPublished = isPublished;

    await resource.save();
    await resource.populate('uploadedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message
    });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (
      resource.uploadedBy.toString() !== req.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own resources'
      });
    }

    // Delete file from Cloudinary if it exists
    if (resource.cloudinaryId) {
      try {
        await deleteFromCloudinary(resource.cloudinaryId);
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        // Continue with resource deletion even if file deletion fails
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
};

export const likeResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const likeIndex = resource.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      resource.likes.splice(likeIndex, 1);
    } else {
      resource.likes.push(req.userId);
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Resource unliked' : 'Resource liked',
      data: { likesCount: resource.likes.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like resource',
      error: error.message
    });
  }
};
