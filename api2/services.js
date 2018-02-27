const lessondb = require('./lesson-MongoDB');
const userdb = require('./user-MongoDB');
const teachingClassdb = require('./teachingClass-MongoDB');

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
module.exports.isUserOwner = async (userName, data) => {
  if(userName == data.owner) {
    return true;
  }
  
  return false;
}
//Find out if a user is  owner of a poll, lesson, quiz or an Admin
module.exports.isUserOwnerOrAdmin = async (userName, data) => {
  if(userName == data.owner) {
    return true;
  }
  let user = await userdb.getByUserName(userName);
  
  if(user.userType == "Admin"){
    return true;
    
  }
  return false;
}

//Find out if a user is allowed to access  a lesson, poll, quiz
module.exports.isUserAllowedAccess = async (userName, data) => {
  let user = await userdb.getByUserName(userName);
//  let teachingClass = await teachingClassdb.getByTeachingClassById(classId);
  if(user.userType === "Admin") {
    return true;
  }
  //Check what Teaching classes the user is in
  let teachingClassesRes = await teachingClassdb.getUsersTeachingClasses(userName);
  let teachingClasses = []
  teachingClassesRes.forEach((name) => {
   teachingClasses.push(name.name);
  })
  
  //Check if user is in the access array
  const userAccess = data.access.find((user) => {
    return user == userName;
   });
  console.log("user Acess", userAccess === userName)
  //If there allowed access in this array
  if(userAccess === userName) {
    return true;
  }
  //Check if any classes are in the access list
  const classAccess = data.access.find((cla) => {
    console.log(teachingClasses, cla)
    return teachingClasses.includes(cla);
   });
  console.log("class Access", classAccess)
  // If they are in a class assosiated whith this item
  if(classAccess !== undefined) {
    return true;
  }
  
  //Gather the lesson data
  let lessonIds = []
  data.lesson.forEach((lesson) => {
    lessonIds.push(parseInt(lesson))
  })
  
  const lessonData = await lessondb.getByIds(lessonIds)
  
  // Check if lessons allow a user to access the content
  let access = false
  lessonData.forEach((lesson) => {

    const userAccess = lesson.access.find((user) => {
      return user == userName;
    });
    
    const classAccess = lesson.access.find((cla) => {
      return teachingClasses.includes(cla);
    });
    
    if(userAccess || classAccess){
      access = true;
    }
  });
  // If the lesson allows access
  if(access) {
    return true;
  }
  
  //If all else fails Kick em out!
  return false;
}

//Find out if a user is in a class
module.exports.isUserInClass = async (classId, userName) => {
  let teachingClass = await teachingClassdb.getByTeachingClassById(classId);
  let student = teachingClass.students.find(student => student == userName);
  return student? true : false;
  
}

module.exports.getUsersTeachingClasses = async (userName) => {
  let teachingClasses = [];
  console.log("2.1")
  let teachingClassesRes = await teachingClassdb.getUsersTeachingClasses(userName);
  console.log("2.2")
  //Turn it into an array of strings
  teachingClassesRes.forEach((name) => {
  console.log("2.3")
   teachingClasses.push(name.name);
  })
  console.log("2.4")
  console.log(teachingClasses)
  return teachingClasses;
}
/************* End User Functions *************/


