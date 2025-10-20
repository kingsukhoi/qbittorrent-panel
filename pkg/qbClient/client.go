package qbClient

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/config"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"slices"
	"strings"
)

var client http.Client

func init() {
	jar, _ := cookiejar.New(nil)
	client = http.Client{
		Jar: jar,
	}
}

type Client struct {
	BasePath *url.URL
}

func GetClients() ([]*Client, error) {
	cfg := config.MustGetConfig()

	clients := make([]*Client, 0)

	for _, v := range cfg.Endpoints {
		currClient, err := Login(config.QbLogin{
			BasePath: fmt.Sprintf("%s", v.BasePath),
			Username: v.Username,
			Password: v.Password,
		})
		if err != nil {
			return nil, err
		}
		clients = append(clients, currClient)
	}

	return clients, nil
}

func Login(login config.QbLogin) (*Client, error) {
	baseUrl, err := url.Parse(login.BasePath)
	if err != nil {
		return nil, err
	}

	rtnMe := &Client{
		BasePath: baseUrl,
	}

	data := url.Values{}
	data.Set("username", login.Username)
	data.Set("password", login.Password)

	req, err := http.NewRequest("POST", rtnMe.BasePath.JoinPath("/api/v2/auth/login").String(), strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	//req.Header.Set("Referer", rtnMe.BasePath.String()+"/")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	return rtnMe, err
}

func (c *Client) GetTorrents() ([]*TorrentInfo, error) {
	req, err := http.NewRequest("GET", c.BasePath.String()+"/api/v2/torrents/info?sort=added_on", nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	var rtnMe []*TorrentInfo

	err = json.Unmarshal(body, &rtnMe)
	if err != nil {
		return nil, err
	}
	for _, v := range rtnMe {
		v.QbInstance = c.BasePath.String()
	}

	return rtnMe, nil
}

// GetTracker retrieves the list of trackers for a specific torrent using its infohash.
// Returns a slice of TorrentTracker or an error.
func (c *Client) GetTracker(infohash string) ([]TorrentTracker, error) {
	data := url.Values{}
	data.Set("hash", infohash)

	req, err := http.NewRequest("GET", fmt.Sprintf(c.BasePath.String()+"/api/v2/torrents/trackers?hash=%s", infohash), nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	var rtnMe []TorrentTracker

	err = json.Unmarshal(body, &rtnMe)

	return rtnMe, nil
}

// GetCategories list all the categories in a given client.
// Returns a map of categories where the key is the name of the category, and the value is Category
func (c *Client) GetCategories() (map[string]Category, error) {
	req, err := http.NewRequest("GET", c.BasePath.String()+"/api/v2/torrents/categories", nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var qbCategories map[string]Category

	err = json.Unmarshal(body, &qbCategories)
	if err != nil {
		return nil, err
	}
	return qbCategories, nil

}

// SyncCategories Add the given category to the client.
// If the category exists on the client, it will be skipped
// https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-new-category
func (c *Client) SyncCategories(category *Category) error {
	categoryInClient := slices.ContainsFunc(category.ClientUrls, func(s string) bool {
		return c.BasePath.String() == s
	})
	if categoryInClient {
		return nil
	}

	categoryInClient = false

	data := url.Values{}
	data.Set("category", category.Name)
	data.Set("savePath", category.SavePath)

	slog.Debug("Category", "encoded", data.Encode())

	req, err := http.NewRequest(http.MethodPost, c.BasePath.JoinPath("/api/v2/torrents/createCategory").String(),
		strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 400 {
		return errors.New("category name is empty")
	} else if resp.StatusCode == 409 {
		return errors.New("category name is invalid")
	} else if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return errors.New(string(body))
	}

	return nil
}
