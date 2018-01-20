const lessondb = require('./lesson-MongoDB');

/************* Misalanious Functions *******/

module.exports.getAssosiatedLessons = async(id, type) => {
   const lessons = await lessondb.getRelatedData(id, type);
   let lessonsArray = [];
   lessons.forEach(lesson => lessonsArray.push(lesson.lessonId));
   return lessonsArray;
}

module.exports.removeAssosiatedLessons = async(id, type) => {
  const lessons = await getAssosiatedLessons(id);
  lessons.forEach(lesson => lessondb.deleteRelatedItem(lesson, type, id))
}

module.exports.addAssosiatedLessons = async(lessons, type, featureId, featureTitle) => {
  lessons.forEach(lesson =>{
    lessondb.updateRelatedItem(parseInt(lesson), type, featureId, featureTitle);
  })
}

/************* End Misalanious Functions *******/