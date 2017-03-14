package models

import java.util.Date
import javax.inject.{Inject, Singleton}

import play.api.db.DBApi

@Singleton
class Performance @Inject()(dBApi: DBApi) {

  def done(taskId: Long): Unit = {
  }

  def doneNum(taskId: Long, rangeStart: Date, rangeEnd: Date): Int  = {
    0
  }
}
