package controllers

import javax.inject._

import models.{Task, Tasks}
import play.api.Play.current
import play.api.i18n.Messages.Implicits._
import play.api.mvc._

@Singleton
class TodoController @Inject() (Tasks : Tasks) extends Controller {

  def tasks = Action {
    Ok(views.html.tasks.index(Tasks.all(), Task.taskForm))
  }

  def newTask = Action { implicit request =>
    Task.taskForm.bindFromRequest.fold(
      errors => BadRequest(views.html.tasks.index(Tasks.all(), errors)),
      label => {
        Tasks.create(label)
        Redirect(routes.TodoController.tasks)
      }
    )
  }
}