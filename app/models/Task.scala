package models

import javax.inject.{Inject, Singleton}
import anorm._
import anorm.SqlParser._

import play.api.data.Form
import play.api.db.DBApi

import play.api.data._
import play.api.data.Forms._

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
class Tasks @Inject()(dBApi: DBApi) {
  private val db = dBApi.database("default")

  val task = get[Long]("id") ~ get[String]("body") ~ get[Boolean]("is_complete") map {
    case id ~ body ~ is_complete => Task(id, body, is_complete)
  }

  def all(): List[Task] = db.withConnection { implicit connection =>
    SQL("select * from task").as(task *)
  }

  def create(body: String, is_complete: Boolean) {
    db.withConnection { implicit connection =>
      SQL("insert into task (body,is_complete) values ({body},{is_complete})").on(
        'body -> body,
        'is_complete -> is_complete
      ).executeUpdate()
    }
  }

  def delete(id: Long): Unit = ???
}
