
// https://godoc.org/github.com/mjibson/goon
package main

import (
	"time"
	"net/http"
	"github.com/mjibson/goon"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine"
	"google.golang.org/appengine/datastore"
	"github.com/google/uuid"
	"errors"
)

type TaskGoon struct {
	Id    string 	`datastore:"-" goon:"id"`
	Uid  *datastore.Key `datastore:"-" goon:"parent"`
	Text string	`datastore:"text"`
	Memo string `datastore:"memo"`
	Tag	 string `datastore:"tag"`
	IsReview bool `datastore:"is_review"`
	NormCount int `datastore:"norm_count"`
	Count int	 `datastore:"count"`
	Priority int `datastore:"priority"`
	CreatedAt time.Time `datastore:"created_at"`
	UpdatedAt time.Time `datastore:"updated_at"`
	ReviewedAt time.Time `datastore:"reviewed_at"`
}

type ProfileGoon struct {
	Uid string `datastore:"-" goon:"id"` // id
	UserName string	`datastore:"user_name"` // user name
	CreatedAt time.Time `datastore:"created_at"`
}

type taskDbGoon struct {
	goon string
}

func newDbGoon() *taskDbGoon {
	return &taskDbGoon{goon: ""}
}

func (db *taskDbGoon) GetProfileKey(uid string, r *http.Request) (*datastore.Key, error) {
	g := goon.NewGoon(r)
	pkey := ProfileGoon{Uid: uid}
	if uid_key, err := g.KeyError(&pkey); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return nil, err
	} else {
		return uid_key, nil
	}
}

func (db *taskDbGoon) GetTask(key string, uid string, r *http.Request) (Task, error) {
	g := goon.NewGoon(r)

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return Task{}, err
	}

	w := new(TaskGoon)
	w.Id = key
	w.Uid = uid_key

	if err := g.Get(w); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return Task{}, err
	}

	if w.Uid != uid_key {
		return Task{}, errors.New("uid invalid")
	}

	v := Task{
		Id: key,
		Text: w.Text,
		Memo: w.Memo,
		Tag: w.Tag,
		IsReview: w.IsReview,
		NormCount: w.NormCount,
		Count: w.Count,
		Priority: w.Priority,
		CreatedAt: w.CreatedAt,
		UpdatedAt: w.UpdatedAt,
		ReviewedAt: w.ReviewedAt,
	}

	return v, nil
}

func (db *taskDbGoon) GetAll(uid string, is_review bool, duration_s string, r *http.Request) ([]Task, error) {

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return []Task{}, err
	}

	filter := datastore.NewQuery("TaskGoon").Ancestor(uid_key)
	if (is_review) {
		filter = filter.Filter("is_review =", true)
	}

	if (duration_s != "") {
		d, err := time.ParseDuration(duration_s)
		if err!=nil {
			log.Debugf(appengine.NewContext(r), "%v duration:%v", err, duration_s)
			return []Task{}, err
		}
		filter = filter.Filter("reviewed_at <", time.Now().Add(time.Duration(-1)*d)).Order("reviewed_at")
	}

	filter = filter.Order("-created_at").Limit(100).Offset(0)

	tasks := []TaskGoon{}
	g := goon.NewGoon(r)
	if _, err := g.GetAll(filter, &tasks); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return []Task{}, err
	}

	ws := []Task{}
	for _, w := range tasks {
		v := Task{
			Id: w.Id,
			Text: w.Text,
			Memo: w.Memo,
			Tag: w.Tag,
			IsReview: w.IsReview,
			NormCount: w.NormCount,
			Count: w.Count,
			Priority: w.Priority,
			CreatedAt: w.CreatedAt,
			UpdatedAt: w.UpdatedAt,
			ReviewedAt: w.ReviewedAt,
		}
		ws = append(ws, v)
	}

	return ws, nil
}

func (db *taskDbGoon) GetPublicAll(uid string, r *http.Request) ([]Task, error) {
	if all, err := db.GetAll(uid, false, "", r); err != nil {
		return []Task{}, err
	} else {
		ws := []Task{}
		for _, w := range all {
			v := Task{
				Id: w.Id,
				Text: w.Text,
				Memo: "",
				Tag: "",
				IsReview: false,
				NormCount: 0,
				Count: w.Count,
				Priority: w.Priority,
				CreatedAt: w.CreatedAt,
				UpdatedAt: w.UpdatedAt,
				ReviewedAt: w.ReviewedAt,
			}
			ws = append(ws, v)
		}

		return ws, nil
	}
}

func (db *taskDbGoon) GenId(r *http.Request) (string, error) {
	uuid, err1 := uuid.NewUUID()
	if err1 != nil {
		log.Debugf(appengine.NewContext(r), "%v", err1)
		return "", err1
	}
	key := string(uuid.String()[0:5])

	return key, nil
}

func (db *taskDbGoon) AddTask(uid string, w PostTask, r *http.Request) (string, error) {

	key, err1 := db.GenId(r)
	if err1 != nil {
		log.Debugf(appengine.NewContext(r), "%v", err1)
		return "", err1
	}

	g := goon.NewGoon(r)

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return "", err
	}

	wg := TaskGoon{
		Id:   key,
		Uid:  uid_key,
		Text: w.Text,
		Memo: "",
		Tag:  "",
		IsReview: false,
		NormCount: 0,
		Count: 0,
		Priority: 0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		ReviewedAt: time.Now(),
	}

	if _, err := g.Put(&wg); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return "", err
	}
	log.Debugf(appengine.NewContext(r), "%v", wg)

	return key, nil
}

func (db *taskDbGoon) EditTask(id string, uid string, ew EditTask, r *http.Request) (Task, error) {

	g := goon.NewGoon(r)

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return Task{}, err
	}

	w := new(TaskGoon)
	w.Id = id
	w.Uid = uid_key
	if err := g.Get(w); err != nil {
		log.Debugf(appengine.NewContext(r), "edit:%v", err)
		return Task{}, err
	}

	if w.Uid != uid_key {
		return Task{}, errors.New("uid invalid")
	}

	if (ew.Kind!="text") {
		ew.Text = w.Text
	}
	if (ew.Kind!="memo") {
		ew.Memo = w.Memo
	}
	if (ew.Kind!="is_review") {
		ew.IsReview = w.IsReview
	}
	if (ew.Kind!="norm_count") {
		ew.NormCount = w.NormCount
	}
	if (ew.Kind!="count") {
		ew.Count = w.Count
	}
	if (ew.Kind!="reviewed_at") {
		ew.ReviewedAt = w.ReviewedAt
	} else {
		ew.ReviewedAt = time.Now()
	}

	wg := TaskGoon{
		Id:   id,
		Uid:  uid_key,
		Text: ew.Text,
		Memo: ew.Memo,
		Tag: w.Tag,
		IsReview: ew.IsReview,
		NormCount: ew.NormCount,
		Count: ew.Count,
		Priority: ew.Priority,
		CreatedAt: w.CreatedAt,
		UpdatedAt: time.Now(),
		ReviewedAt: ew.ReviewedAt,
	}

	if _, err := g.Put(&wg); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return Task{}, err
	}

	w2, err := db.GetTask(id, uid, r)
	log.Debugf(appengine.NewContext(r), "updated:%v", w2)
	return w2, err
}

func (db *taskDbGoon) CopyTask(id string, uid string, r *http.Request) (Task, error) {

	g := goon.NewGoon(r)

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return Task{}, err
	}

	new_id, err1 := db.GenId(r)
	if err1 != nil {
		log.Debugf(appengine.NewContext(r), "%v", err1)
		return Task{}, err1
	}

	w := new(TaskGoon)
	w.Id = id
	w.Uid = uid_key
	if err := g.Get(w); err != nil {
		log.Debugf(appengine.NewContext(r), "edit:%v", err)
		return Task{}, err
	}

	if w.Uid != uid_key {
		return Task{}, errors.New("uid invalid")
	}

	wg := TaskGoon{
		Id:   new_id,
		Uid:  uid_key,
		Text: w.Text,
		Memo: "",
		Tag: "",
		IsReview: false,
		NormCount: w.NormCount,
		Count: 0,
		Priority: w.Priority,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		ReviewedAt: time.Now(),
	}

	if _, err := g.Put(&wg); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return Task{}, err
	}

	w2, err := db.GetTask(new_id, uid, r)
	log.Debugf(appengine.NewContext(r), "updated:%v", w2)
	return w2, err
}


func (db *taskDbGoon) Delete(id string, uid string, r *http.Request) error {
	g := goon.NewGoon(r)

	uid_key, err := db.GetProfileKey(uid, r)
	if err != nil {
		return err
	}

	w := new(TaskGoon)
	w.Id = id
	w.Uid = uid_key
	if err := g.Get(w); err != nil {
		log.Debugf(appengine.NewContext(r), "delete:%v", err)
		return err
	}

	if w.Uid != uid_key {
		return errors.New("uid invalid")
	}

	wkey := new(TaskGoon)
	wkey.Id = id
	wkey.Uid = uid_key
	key, err := g.KeyError(wkey)
	if err != nil {
		return err
	}

	err2 := g.Delete(key)
	return err2
}

func (db *taskDbGoon) GetUidByUser(user string, r *http.Request) (string, error) {
	g := goon.NewGoon(r)

	profiles := []ProfileGoon{}
	if _, err := g.GetAll(datastore.NewQuery("ProfileGoon").Filter("user_name =", user), &profiles); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return "", err
	}

	if len(profiles) == 0 {
		log.Debugf(appengine.NewContext(r), "not found user %v", user)
		return "", errors.New("not found user")
	}

	return profiles[0].Uid, nil
}

func (db *taskDbGoon) GetUser(uid string, r *http.Request) (string, error) {
	g := goon.NewGoon(r)
	p := ProfileGoon{Uid: uid}
	if err := g.Get(&p); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return "", err
	} else {
		log.Debugf(appengine.NewContext(r), "login with %v", p)
		return p.UserName, nil
	}
}


func (db *taskDbGoon) NewUser(uid string, user string, r *http.Request) error {
	g := goon.NewGoon(r)

	// TODO validate username
	if len(user) < 3 {
		return errors.New("too short")
	}

	profiles := []ProfileGoon{}
	if _, err := g.GetAll(datastore.NewQuery("ProfileGoon").Filter("user_name =", user), &profiles); err != nil {
		log.Debugf(appengine.NewContext(r), "%v", err)
		return err
	}

	if len(profiles) != 0 {
		return errors.New("already in")
	}

	pkey := ProfileGoon{
		Uid: uid,
		UserName: user,
		CreatedAt: time.Now(),
	}
	_, err := g.Put(&pkey)

	return err
}
