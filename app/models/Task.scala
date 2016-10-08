package models

case class Task(
                 id: Long,
                 body: String,
                 is_complete: Boolean
                 // TODO due: Datetime
               )

object Task {

  def all(): List[Task] = Nil

  def create(b: String): Task = {
    ???
  }

  def delete(id: Long): Unit = ???

}