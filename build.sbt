name := """weekly"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  evolutions,
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test
)

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "anorm" % "2.5.2"
)

libraryDependencies ++= Seq(
  "org.webjars" % "bootstrap" % "3.3.4",
  "org.webjars" %  "react"    % "0.14.8"
)

includeFilter in (Assets, LessKeys.less) := "main.less"

excludeFilter in (Assets, LessKeys.less) := "_*.less"
fork in run := true