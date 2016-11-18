package controllers

import javax.inject._

import models.{Task, Tasks}
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.mvc._
import play.api.libs.json.Json

@Singleton
class TodoController @Inject()(val messagesApi: MessagesApi, Tasks: Tasks) extends Controller with I18nSupport {

  implicit val taskFormat = Json.format[Task]

  def tasks = Action {
    Ok(views.html.tasks.index(Tasks.all()))
  }

  def tasksJson = Action {
    Ok(Json.toJson(Tasks.all()))
  }

  def newTask = Action { implicit request =>
    Task.taskForm.bindFromRequest.fold(
      errors => BadRequest(views.html.tasks.index(Tasks.all())),
      label => {
        Tasks.create(label, false)
        Redirect(routes.TodoController.tasks)
      }
    )
  }

  def newTaskJson = Action(BodyParsers.parse.json) { request =>
    // TODO: 入力の Validation
    val body = (request.body \ "body").as[String]
    val newTaskId = Tasks.create(body, false)
    newTaskId match {
      case Some(id) =>
        val task = Tasks.task(id)
        Ok(Json.toJson(task))
      case None =>
        InternalServerError
    }
  }

  def editTask(id: Long) = Action(BodyParsers.parse.json) { request =>
    val task = Task(
      id,
      (request.body \ "body").as[String],
      (request.body \ "is_complete").as[Boolean]
    )

    Tasks.edit(task)
    Ok(Json.toJson(task))
  }

  def deleteTask(id: Long) = Action { request =>
    val task = Tasks.task(id)
    Tasks.delete(id)
    Ok(Json.toJson(task))
  }
}
