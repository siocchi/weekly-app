package controllers

import javax.inject._

import models.Task
import play.api.Play.current
import play.api.data.Forms._
import play.api.data._
import play.api.i18n.Messages.Implicits._
import play.api.mvc._

@Singleton
class TodoController @Inject() extends Controller {

  val taskForm = Form(
    "body" -> nonEmptyText
  )

  def tasks = Action {
    Ok(views.html.tasks.index(Task.all(), taskForm))
  }

  def newTask = Action { implicit request =>
    taskForm.bindFromRequest.fold(
      errors => BadRequest(views.html.tasks.index(Task.all(), errors)),
      label => {
        Task.create(label)
        Redirect(routes.TodoController.tasks)
      }
    )
  }

}