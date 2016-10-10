package models

import javax.inject.{Inject, Singleton}
import play.api.data.Forms._
import play.api.data._

case class Task(
                 id: Long,
                 body: String,
                 is_complete: Boolean
                 // TODO due: Datetime
               )

object Task {
  val taskForm = Form(
    "body" -> nonEmptyText
  )
}

@Singleton
class Tasks @Inject()() {

  def all(): List[Task] = Nil

  def create(b: String): Task = {
    ???
  }

  def delete(id: Long): Unit = ???
}
