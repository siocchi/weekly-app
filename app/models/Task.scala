package models

import javax.inject.{Inject, Singleton}

import anorm.SqlParser._
import anorm._
import play.api.data.Form
import play.api.data.Forms._
import play.api.db.DBApi

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
    SQL("select * from task where hidden=false order by id").as(task *)
  }

  def create(body: String, is_complete: Boolean): Option[Long] = {
    db.withConnection { implicit connection =>
      SQL("insert into task (body,is_complete) values ({body},{is_complete})").on(
        'body -> body,
        'is_complete -> is_complete
      ).executeInsert()
    }
  }

  def edit(task: Task): Unit = {
    db.withConnection { implicit connection =>
      SQL("update task set body={body},is_complete={is_complete} where id={id}").on(
        'body -> task.body,
        'is_complete -> task.is_complete,
        'id -> task.id
      ).executeUpdate()
    }
  }

  def task(id: Long): Option[Task] = {
    db.withConnection { implicit connection =>
      SQL("select * from task where id={id}").on('id -> id).as(task *) headOption
    }
  }

  def delete(id: Long): Unit = {
    db.withConnection { implicit connection =>
      SQL("update task set hidden=true where id={id}").on(
        'id -> id
      ).executeUpdate()
    }
  }
}
