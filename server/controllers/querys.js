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
    let condition = [];

    if (studentId) condition.push({ studentID: { $eq: mongoose.Types.ObjectId(studentId) } })
    if (subjectId) condition.push({ subjectID: { $eq: mongoose.Types.ObjectId(subjectId) } })


    const aggregationPipeline = [
      {
        $group: {
          _id: "$studentID",
          totalMarks: { $sum: "$marks" },
          totalSubjects: { $sum: 1 },
          imgPaths: { $push: "$imgData.path" }
        }
      },
      {
        $lookup: {
          from: "studentTable",
          localField: "_id",
          foreignField: "_id",
          as: "studentDetails"
        }
      },
      {
        $unwind: "$studentDetails"
      },
      {
        $project: {
          _id: 0,
          studentID: "$_id",
          totalMarks: 1,
          totalSubjects: 1,
          firstName: "$studentDetails.firstName",
          lastName: "$studentDetails.lastName",
          average: { $divide: ["$totalMarks", "$totalSubjects"] },
          imgPaths: 1
        }
      },
      {
        $sort: {
          average: -1
        }
      }
    ];

    if (averageStart || averageEnd) {
      const marksPerSubjectMatch = {};
      if (averageStart) {
        if (averageStart < 0 || averageStart > 100) throw new Error("Enter valid average Value")
        marksPerSubjectMatch['average'] = { $gte: parseFloat(averageStart) };
      }
      if (averageEnd) {
        if (averageEnd < 0 || averageEnd > 100) throw new Error("Enter valid average Value")
        marksPerSubjectMatch['average'] = { ...marksPerSubjectMatch['average'], $lte: parseFloat(averageEnd) };
      }
      aggregationPipeline.push({ $match: marksPerSubjectMatch });
    }

    if (condition.length > 0) {
      aggregationPipeline.unshift({ $match: { $and: condition } });
    }
    let listStudent;

    if (limit && page) {
      console.log(JSON.stringify(aggregationPipeline))
      listStudent = await marksModel.aggregate(aggregationPipeline)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();
    } else {
      listStudent = await marksModel.aggregate(aggregationPipeline).exec();
    }
    console.log(listStudent)
    aggregationPipeline.push({ $count: 'total' })
    let totalDocuments = await marksModel.aggregate(aggregationPipeline).exec();

    res.status(200).json({ data: listStudent, total: totalDocuments[0]?.total || 0 });

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
