const Student = require("../models/studentModel");
const DepartmentCandidate = require("../models/departmentCandidateModel");
const Election = require("../models/departmentElectionModel");
const Announce = require("../models/announceModel");
const Ticket = require("../models/ticketModel");
const Admin = require("../models/adminModel");
const Department = require("../models/departmentModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const moment = require("moment");

exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, surname, iztechMail, password } = req.body;
  const newAdmin = new Admin({
    name,
    surname,
    iztechMail,
    password,
  });
  await newAdmin.save();
  res.status(200).json({
    status: "success",
    data: {
      newAdmin,
    },
  });
});

exports.getAllStudents = catchAsync(async (req, res, next) => {
  const students = await Student.find();
  res.status(200).json({
    status: "success",
    results: students.length,
    data: {
      students,
    },
  });
});

exports.getStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return next(new AppError("No student found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

exports.getAllDepartmentCandidates = catchAsync(async (req, res, next) => {
  const candidates = await DepartmentCandidate.find().populate({
    path: "studentInfos",
  });

  res.status(200).json({
    status: "success",
    results: candidates.length,
    data: {
      candidates,
    },
  });
});

exports.startElection = catchAsync(async (req, res, next) => {
  const currentDateTime = new Date();
  const endDate = new Date(currentDateTime.getTime() + 24 * 60 * 60 * 1000);

  const departmentElection = new Election({
    startDate: currentDateTime,
    endDate: endDate,
    isStarted: true,
    isEnded: false,
  });

  await departmentElection.save();

  res.status(200).json({
    status: "success",
    message: "Seçim başlatıldı.",
    data: {
      departmentElection,
    },
  });
});

exports.endElection = catchAsync(async (req, res, next) => {
  const election = await Election.findOne({
    isStarted: true,
    isEnded: false,
  });
  if (!election) {
    return next(new AppError("Seçim henüz başlamadı veya bitti", 400));
  }
  election.isEnded = true;
  await election.save();
  res.status(200).json({
    status: "success",
    message: "Seçim sonlandırıldı.",
    data: {
      election,
    },
  });
});

//sonra tekrar kontrol edilcek
exports.announceDepartmentWinners = catchAsync(async (req, res, next) => {
  const departments = await Department.find();
  const winnersByDepartment = await Promise.all(
    departments.map(async (department) => {
      const winners = await DepartmentCandidate.find({
        department: department._id,
      })
        .sort({ voteCount: -1 })
        .populate("studentInfos");
      const topThreeWinners = winners.slice(0, 3);
      return {
        department: department.name,
        winners: topThreeWinners,
      };
    })
  );
  res.status(200).json({
    status: "success",
    winnersByDepartment,
  });
});

exports.makeAnnouncement = catchAsync(async (req, res, next) => {
  const adminId = req.params.id;
  const body = Object.keys(req.body)[0];
  const fixedResponse = body.replace(/'/g, '"');
  const parsedResponse = JSON.parse(fixedResponse);
  const { title, description } = parsedResponse;
  const newAnnounce = new Announce({
    title,
    description,
    //burası sonradan eklencek
    //sender: adminId,
  });
  await newAnnounce.save();
  res.status(200).json({
    status: "success",
    data: {
      newAnnounce,
    },
  });
});

//burası student için de kullanılabilir
exports.getAnnouncements = catchAsync(async (req, res, next) => {
  const announces = await Announce.find().sort({ date: -1 });
  res.status(200).json({
    status: "success",
    results: announces.length,
    data: {
      announces,
    },
  });
});

exports.getTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find().sort({ date: -1 });
  res.status(200).json({
    status: "success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});
