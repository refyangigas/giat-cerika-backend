const Quiz = require('../models/Quiz');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.createQuiz = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const { title, description, questions } = req.body;
    
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Upload images ke Cloudinary
    for (let i = 0; i < parsedQuestions.length; i++) {
      const fileKey = `image_${i}`;
      if (req.files && req.files[fileKey]) {
        const file = req.files[fileKey][0];
        console.log(`Processing file for question ${i}:`, file.originalname);

        try {
          const uploadResult = await uploadToCloudinary(file);
          console.log(`Upload result for question ${i}:`, uploadResult);

          parsedQuestions[i].image = {
            url: uploadResult.url,
            public_id: uploadResult.public_id,
            size: file.size
          };
        } catch (uploadError) {
          console.error(`Error uploading image for question ${i}:`, uploadError);
          // Continue with other questions even if one upload fails
        }
      }
    }

    // Create quiz instance
    const quiz = new Quiz({
      title,
      description,
      questions: parsedQuestions
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }

    // Process each question
    for (let i = 0; i < parsedQuestions.length; i++) {
      const fileKey = `image_${i}`;
      
      // If there's a new file to upload
      if (req.files && req.files[fileKey]) {
        const file = req.files[fileKey][0];
        console.log(`Processing new file for question ${i}:`, file.originalname);

        // Delete old image if exists
        if (existingQuiz.questions[i]?.image?.public_id) {
          try {
            await deleteFromCloudinary(existingQuiz.questions[i].image.public_id);
          } catch (deleteError) {
            console.error(`Error deleting old image for question ${i}:`, deleteError);
          }
        }

        // Upload new image
        try {
          const uploadResult = await uploadToCloudinary(file);
          console.log(`Upload result for question ${i}:`, uploadResult);

          parsedQuestions[i].image = {
            url: uploadResult.url,
            public_id: uploadResult.public_id,
            size: file.size
          };
        } catch (uploadError) {
          console.error(`Error uploading new image for question ${i}:`, uploadError);
          parsedQuestions[i].image = null; // Reset image if upload fails
        }
      } else if (existingQuiz.questions[i]?.image) {
        // Keep existing image if no new file is uploaded
        parsedQuestions[i].image = existingQuiz.questions[i].image;
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        questions: parsedQuestions,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedQuiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz tidak ditemukan' });
    }

    // Delete all associated images from Cloudinary
    for (const question of quiz.questions) {
      if (question.image?.public_id) {
        try {
          await deleteFromCloudinary(question.image.public_id);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz berhasil dihapus' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: error.message });
  }
};