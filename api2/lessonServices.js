const lessondb = require('./lesson-MongoDB');
const userdb = require('./user-MongoDB');
/************* Lesson Functions *******/

//Find lessons assosiated with a poll/quiz
module.exports.getAssosiatedLessons = async(id, type) => {
   const lessons = await lessondb.getRelatedData(id, type);
   let lessonsArray = [];
   lessons.forEach(lesson => lessonsArray.push(lesson.lessonId));
   return lessonsArray;
}

// Remove  a poll/quiz from a lesson
module.exports.removeAssosiatedLessons = async(id, type) => {
  const lessons = await getAssosiatedLessons(id);
  lessons.forEach(lesson => lessondb.deleteRelatedItem(lesson, type, id))
}

//Add a poll/quiz to a lesson
module.exports.addAssosiatedLessons = async(lessons, type, featureId, featureTitle) => {
  lessons.forEach(lesson =>{
    lessondb.updateRelatedItem(parseInt(lesson), type, featureId, featureTitle);
  })
}

/************* End Lesson Functions *******/

/************* User Functions *************/

//Find out what role the user has e.g. student 
module.exports.userRole = async (userName) => {
  let user = await userdb.getByUserName(userName);
  return user? user.userType : null;
}

//Find out if a user is  admin 
module.exports.isUserAdmin = async (userName) => {
    let user = await userdb.getByUserName(userName);
  return user.userType === "Admin";
}

//Find out if a user is  owner of a poll, lesson, quiz 
module.exports.isUserOwner = async (userName) => {
  
}

//Find out if a user is allowed to access  a lesson, poll, quiz
module.exports.isUserAllowedAccess = async (userName, type,  itemId) => {
  let user = await userdb.getByUserName(userName);
  if(user.userType === "Admin") {
    return true;
  }
  
  
}
/************* End User Functions *************/

