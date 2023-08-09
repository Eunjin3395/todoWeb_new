const todoModel = require("../models/todoModel.js");
const userModel = require("../models/userModel.js");

/**
 * 대상 회원의 해당 년월 투두 목록을 불러옴
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getMonthlyTodo = async (req, res) => {
  let fromNum = req.session.userNum;
  let toId = req.query.userId;
  let year = req.query.year;
  let month = req.query.month;
  if (fromNum == undefined) {
    // 세션 만료된 경우
    return { msg: "session expired." };
  }
  console.log("-- GET monthly todo -- from:", req.session.userId, ", to: ", toId, "date: ", year, month);

  let toNum = await userModel.findUserNumById(toId);

  // 본인의 투두 목록 조회 시: category access 따지지 않아도 됨
  if (fromNum === toNum) {
    let getTodoResult = await todoModel.getMonthTodo(toNum, year, month);
    console.log("========todoResult============");
    console.log(getTodoResult);
    return getTodoResult;
  }
};

/**
 * 회원이 가진 카테고리 목록 불러옴
 * @param {*} req
 * @param {*} res
 */
module.exports.getCategory = async (req, res) => {
  console.log("-- GET category -- from:", req.session.userId);
  let catResult = await todoModel.getCategories(req.session.userNum);
  console.log("=============catResult==================");
  console.log(catResult);
  return catResult;
};

/**
 * db에 투두 데이터 추가한 뒤 해당 월의 모든 투두 데이터 리턴
 * @param {*} req
 * @param {*} res
 */
module.exports.insertTodo = async (req, res) => {
  let userNum = req.session.userNum;
  if (userNum == undefined) {
    return { msg: "session expired." };
  }
  let catId = req.body.cat_id;
  let todoCont = req.body.todo_cont;
  let { year, month, day } = req.body.todo_date;
  console.log(" -- POST todo -- from user_num: ", userNum, "cat_id: ", catId, " cont: ", todoCont, " date: ", year, month, day);
  let insertResult = await todoModel.insertTodoData(userNum, catId, todoCont, req.body.todo_date);
  let monthlyTodo = await todoModel.getMonthTodo(userNum, req.body.todo_date.year, req.body.todo_date.month); // 해당 월의 모든 투두 데이터 리턴

  console.log("=============insertResult==============");
  console.log(insertResult);
  return monthlyTodo;
};

/**
 * 투두의 체크 및 체크해제 db에 업데이트 후 해당 월의 모든 투두 데이터 리턴
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.checkTodo = async (req, res) => {
  let checked = req.body.checked;
  let todoId = req.body.todo_id;
  let userNum = req.session.userNum;
  if (userNum == undefined) {
    return { msg: "session expired." };
  }
  if (checked) {
    // todo check 처리
    console.log(" -- todo checked request -- todo_id:", todoId);
    let checkResult = await todoModel.checkTodo(todoId); // 투두 check update
    var monthlyTodo = await todoModel.getMonthTodo(userNum, req.body.todo_date.year, req.body.todo_date.month); // 해당 월의 모든 투두 데이터 리턴
  } else {
    // todo uncheck 처리
    console.log(" -- todo unchecked request -- todo_id:", todoId);
    let checkResult = await todoModel.uncheckTodo(todoId); // 투두 uncheck update
    var monthlyTodo = await todoModel.getMonthTodo(userNum, req.body.todo_date.year, req.body.todo_date.month); // 해당 월의 모든 투두 데이터 리턴
  }
  return monthlyTodo;
};
