package main

import (
	"net/http"
	"gopkg.in/gin-gonic/gin.v1"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine"
	"time"
)

type TaskDb interface {
	GetAll(string, bool, string, *http.Request) ([]Task, error)

	GetPublicAll(string, *http.Request) ([]Task, error)

	AddTask(string, PostTask, *http.Request) (string, error)

	EditTask(string, string, EditTask, *http.Request) (Task, error)

	Delete(string, string, *http.Request) error

	NewUser(string, string, *http.Request) error

	GetUidByUser(user string, r *http.Request) (string, error)

	GetUser(string, *http.Request) (string, error)
}

type (
	Task struct {
		Id    string 	`json:"id"`
		Text string	`json:"text"`
		Memo string `json:"memo"`
		Tag	 string `json:"tag"`
		IsReview bool `json:"is_review"`
		NormCount int `json:"norm_count"`
		Count int	 `json:"count"`
		Priority int `json:"priority"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
		ReviewedAt time.Time `json:"reviewed_at"`
	}

	PostTask struct {
		Text     string `form:"text" json:"text" binding:"required"`
	}

	EditTask struct {
		Kind     string `form:"kind" json:"kind"`
		Text     string `form:"text" json:"text"`
		Memo     string `form:"memo" json:"memo"`
		IsReview bool `json:"is_review"`
		NormCount int `json:"norm_count"`
		Count     int `form:"count" json:"count"`
		Priority  int `form:"priority" json:"priority"`
		ReviewedAt time.Time `json:"reviewed_at"`
	}

	PostUser struct {
		User     string `form:"user" json:"user" binding:"required"`
	}
)

var (
	db TaskDb
)

func tasks(c *gin.Context) {

	profile := profileFromSession(c.Request)
	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}
	is_review := c.Query("is_review") == "true";
	duration := c.Query("duration");

	c.Header("Access-Control-Allow-Origin", "*")
	if all, err := db.GetAll(profile.ID, is_review, duration, c.Request); err == nil {
		c.JSON(http.StatusOK, all)
	} else {
		c.JSON(http.StatusBadRequest, "error")
	}
}

func tasksUnauthorized(c *gin.Context) {

	uid, err := db.GetUidByUser(c.Param("user"), c.Request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "not found user"})
		return
	}

	c.Header("Access-Control-Allow-Origin", "*")
	if all, err := db.GetPublicAll(uid, c.Request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error"})
	} else {
		c.JSON(http.StatusOK, all)
	}
}

func create(c *gin.Context) {
	var json PostTask
	c.Header("Access-Control-Allow-Origin", "*")

	profile := profileFromSession(c.Request)
	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	if c.BindJSON(&json) == nil {
		log.Debugf(appengine.NewContext(c.Request), "post:%v", json)
		db.AddTask(profile.ID, json, c.Request)
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"status": "parse error"})
	}
}

func edit(c *gin.Context) {
	var json EditTask

	profile := profileFromSession(c.Request)
	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	c.Header("Access-Control-Allow-Origin", "*")
	if c.BindJSON(&json) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "parse error"})
		return
	}
	if w, err := db.EditTask(c.Param("id"), profile.ID, json, c.Request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "something wrong"})
	} else {
		c.JSON(http.StatusOK, w)
	}
}

func delete(c *gin.Context) {
	id := c.Param("id")

	profile := profileFromSession(c.Request)
	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	c.Header("Access-Control-Allow-Origin", "*")
	err := db.Delete(id, profile.ID, c.Request)
	if err != nil {
		log.Debugf(appengine.NewContext(c.Request), "delete error:%v", err)
		c.JSON(http.StatusBadRequest, gin.H{"status": "error"})
	} else {
		log.Debugf(appengine.NewContext(c.Request), "delete:%v", id)
		c.JSON(http.StatusOK, gin.H{"status":"ok"})
	}
}

func createUser(c *gin.Context) {
	profile := profileFromSession(c.Request)
	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	var json PostUser
	if c.BindJSON(&json) != nil {
		log.Debugf(appengine.NewContext(c.Request), "failed to create ")
		c.JSON(http.StatusBadRequest, gin.H{"status": "bad request"})
		return
	}

	if err := db.NewUser(profile.ID, json.User, c.Request); err != nil {
		log.Debugf(appengine.NewContext(c.Request), "failed to create %v %v", profile, json)
		c.JSON(http.StatusBadRequest, gin.H{"status": "bad request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func profile(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "Content-Type")

	var profile = profileFromSession(c.Request)

	if profile == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	var user string
	var err error
	if user, err = userFromSession(c.Request); err != nil {
		user, err = db.GetUser(profile.ID, c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "unregistered"})
			return
		}
		if err := storeAdditionalInfo(user, c.Request); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "something wrong"})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"user_name": user, "image_url": profile.ImageURL, "screen_name": profile.DisplayName})
}

func init() {
	db = newDbGoon() // newDbMem()

	gin.SetMode(gin.DebugMode)
	r := gin.Default()

	r.GET("/v1/tasks.json", tasks)
	r.OPTIONS("/v1/task.json", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
	})
	r.POST("/v1/task.json", create)

	r.OPTIONS("/v1/task/:id/edit.json", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		c.Header("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS")
	})
	r.POST("/v1/task/:id/edit.json", edit)
	r.DELETE("/v1/task/:id/edit.json", delete)

	r.POST("/v1/create_user.json", createUser)
	r.GET("/v1/profile.json", profile)
	r.GET("/v1/user/:user/tasks.json", tasksUnauthorized)

	http.HandleFunc("/v1/login", loginHandler)
	http.HandleFunc("/v1/logout", logoutHandler)
	http.HandleFunc("/v1/oauth2callback", oauthCallbackHandler)

	http.Handle("/v1/", r)
}
