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
    Ok(views.html.tasks.index(Tasks.all(), Task.taskForm))
  }

  def tasksJson = Action {
    Ok(Json.toJson(Tasks.all()))
  }

  def newTask = Action { implicit request =>
    Task.taskForm.bindFromRequest.fold(
      errors => BadRequest(views.html.tasks.index(Tasks.all(), errors)),
      label => {
        Tasks.create(label, false)
        Redirect(routes.TodoController.tasks)
      }
    )
  }
}
