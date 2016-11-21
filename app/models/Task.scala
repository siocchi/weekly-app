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
                 numQuota: Int
               )

object Task {
  val taskForm = Form(
    "body" -> nonEmptyText
  )
}

@Singleton
class Tasks @Inject()(dBApi: DBApi) {
  private val db = dBApi.database("default")

  val task = get[Long]("id") ~ get[String]("body") ~ get[Int]("num_quota") map {
    case id ~ body ~ num => Task(id, body, num)
  }

  def all(): List[Task] = db.withConnection { implicit connection =>
    SQL("select * from task where hidden=false order by id").as(task *)
  }

  def create(body: String, num: Integer): Option[Long] = {
    db.withConnection { implicit connection =>
      SQL("insert into task (body,num_quota) values ({body},{num_quota})").on(
        'body -> body,
        'num_quota -> num
      ).executeInsert()
    }
  }

  def edit(task: Task): Unit = {
    db.withConnection { implicit connection =>
      SQL("update task set body={body},num_quota={num_quota} where id={id}").on(
        'body -> task.body,
        'num_quota -> task.numQuota,
        'id -> task.id
      ).executeUpdate()
    }
  }

  def task(id: Long): Task = {
    db.withConnection { implicit connection =>
      SQL("select * from task where id={id}").on('id -> id).as(task *) head
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
