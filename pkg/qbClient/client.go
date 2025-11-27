package qbClient

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"slices"
	"strings"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
)

var httpClient http.Client

func init() {
	jar, _ := cookiejar.New(nil)
	httpClient = http.Client{
		Jar: jar,
	}
}

type Client struct {
	BasePath *url.URL
}

// MarshalJSON customizes the JSON output to show only the base path string
func (c *Client) MarshalJSON() ([]byte, error) {
	if c.BasePath == nil {
		return json.Marshal(nil)
	}
	return json.Marshal(c.BasePath.String())
}

func Login(ctx context.Context, login configuration.QbLogin) (*Client, error) {
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

	req, err := http.NewRequestWithContext(ctx, "POST", rtnMe.BasePath.JoinPath("/api/v2/auth/login").String(), strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	//req.Header.Set("Referer", rtnMe.BasePath.String()+"/")

	resp, err := httpClient.Do(req)
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

func (c *Client) GetTorrents(ctx context.Context) ([]*TorrentInfo, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.BasePath.String()+"/api/v2/torrents/info?sort=added_on", nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
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
		v.Client = c
	}

	return rtnMe, nil
}

var TorrentNotFoundError = errors.New("torrent not found")

func (c *Client) GetTorrent(ctx context.Context, infoHash string) (*TorrentInfo, error) {
	// api/v2/torrents/info?hashs={{hash}}

	data := url.Values{}
	data.Set("hashes", infoHash)

	currUrl := c.BasePath.JoinPath("/api/v2/torrents/info")
	currUrl.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", currUrl.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
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

	if len(rtnMe) != 1 {
		return nil, TorrentNotFoundError
	}

	return rtnMe[0], nil

}

// GetTracker retrieves the list of trackers for a specific torrent using its infohash.
// Returns a slice of TorrentTracker or an error.
func (t *TorrentInfo) GetTracker(ctx context.Context, infohash string) ([]*TorrentTracker, error) {
	data := url.Values{}
	data.Set("hash", infohash)

	currUrl := t.Client.BasePath.JoinPath("/api/v2/torrents/trackers")
	currUrl.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", currUrl.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	var rtnMe []*TorrentTracker
	err = json.Unmarshal(body, &rtnMe)

	for _, v := range rtnMe {
		v.TorrentInfo = t
	}
	return rtnMe, nil
}

// GetCategories list all the categories in a given httpClient.
// Returns a map of categories where the key is the name of the category, and the value is Category
func (c *Client) GetCategories(ctx context.Context) (map[string]Category, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.BasePath.String()+"/api/v2/torrents/categories", nil)
	if err != nil {
		return nil, err
	}
	resp, err := httpClient.Do(req)
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

// CreateCategoryIfNotExist Add the given category to the httpClient.
// If the category exists on the httpClient, it will be skipped
// https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-new-category
func (c *Client) CreateCategoryIfNotExist(ctx context.Context, category *Category) error {
	categoryInClient := slices.ContainsFunc(category.Servers, func(s string) bool {
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

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BasePath.JoinPath("/api/v2/torrents/createCategory").String(),
		strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

	resp, err := httpClient.Do(req)
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

func (c *Client) GetFilesInTorrent(ctx context.Context, InfoHashV1 string) ([]TorrentFile, error) {
	data := url.Values{}
	data.Set("hash", InfoHashV1)

	path := c.BasePath.JoinPath("/api/v2/torrents/files")
	path.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, path.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	var qbFiles []TorrentFile
	err = json.Unmarshal(body, &qbFiles)
	if err != nil {
		return nil, err
	}

	return qbFiles, nil
}
