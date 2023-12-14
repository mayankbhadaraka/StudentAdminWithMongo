const studentModel = require("../models/student");
const subjectModel = require("../models/subject");
const marksModel = require("../models/marks");
const mongoose = require("mongoose");

const studentData = async (req, res) => {
  try {
    const data = await studentModel.find().lean();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
};

const subjectData = async (req, res) => {
  try {
    const data = await subjectModel.find().lean();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
};

const sendmarks = async (req, res) => {
  try {
    const { studentID, subjectID, marks } = req.body;

    if (!studentID || !subjectID || !marks) {
      return res.status(406).json({ error: "All fields are required" });
    }

    try {
      await studentModel.findById(studentID);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ error: "Student ID doesnot exists" });
    }

    try {
      await subjectModel.findById(subjectID);
    } catch (error) {
      console.log(error);
      return res.status(406).json({ error: "Subject ID doesnot exists" });
    }

    if (marks > 100 || marks < 0) {
      return res.status(406).json({ error: "Marks must be between 0 to 100" });
    }

    const file = req.file;
    let data = "";
    var object = {};

    if (file) {
      object = {
        fileName: file.filename,
        mimeType: file.mimetype,
        path: "/" + file.path,
        size: file.size,
      };

      data = await marksModel.create({
        studentID: studentID,
        subjectID: subjectID,
        marks: marks,
        imgData: object,
      });
    } else {
      data = await marksModel.create(req.body);
    }

    res.json({
      userData: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Error" });
  }
};

const paginatedData = async (req, res) => {
  try {
    const { studentId, subjectId, averageStart, averageEnd, limit, page } = req.query;
    const skip = limit * (page - 1) || 0;
    const condition = {};

    if (studentId) condition['studentID'] = mongoose.Types.ObjectId(studentId);
    if (subjectId) condition['subjectID'] = mongoose.Types.ObjectId(subjectId);


    const aggregationPipeline = [
      {
        $lookup: {
          from: 'studentTable',
          localField: 'studentID',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student' 
      },
      {
        $lookup: {
          from: 'marksTable',
          localField: 'studentID',
          foreignField: 'studentID',
          as: 'marks'
        }
      },
      {
        $unwind: '$marks' 
      },
      {
        $group: {
          _id: '$studentID',
          totalSubjects: { $sum: 1 },
          totalMarks: { $sum: '$marks.marks' },
          studentData: { $first: '$student' },
          imgPaths: { $push: '$marks.imgData.path' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSubjects: { $pow: ['$totalSubjects', 0.5] },
          totalMarks: 1,
          studentName: { $concat: ['$studentData.firstName', ' ', '$studentData.lastName'] },
          marksPerSubject: { $divide: ['$totalMarks', '$totalSubjects'] },
          imgPaths: 1 
        }
      },
      {
        $sort: {
          marksPerSubject: -1
        }
      }
    ];

    if (averageStart || averageEnd) {
      const marksPerSubjectMatch = {};
      if (averageStart) {
        if(averageStart<0 || averageStart>100) throw new Error("Enter valid average Value")
        marksPerSubjectMatch['marksPerSubject'] = { $gte: parseFloat(averageStart) };
      }
      if (averageEnd) {
        if(averageEnd<0 || averageEnd>100) throw new Error("Enter valid average Value")
        marksPerSubjectMatch['marksPerSubject'] = { ...marksPerSubjectMatch['marksPerSubject'], $lte: parseFloat(averageEnd) };
      }
      aggregationPipeline.push({ $match: marksPerSubjectMatch });
    }

    if (Object.keys(condition).length > 0) {
      aggregationPipeline.unshift({ $match: condition });
    }
    let listStudent;

    if (limit && page) {
      listStudent = await marksModel.aggregate(aggregationPipeline)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();
    } else {
      listStudent = await marksModel.aggregate(aggregationPipeline).exec();
    }
    aggregationPipeline.push({ $count: 'total' })
    let totalDocuments=await marksModel.aggregate(aggregationPipeline).exec();

    res.status(200).json({data:listStudent,total:totalDocuments[0]?.total || 0});

  } catch (error) {
    console.log("Error===>", error);
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
  studentData,
  subjectData,
  sendmarks,
  paginatedData
};
