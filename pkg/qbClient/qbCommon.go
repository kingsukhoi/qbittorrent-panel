package qbClient

import (
	"encoding/json"
	"time"
)

type Common struct {
	QbInstance string `json:"QBInstance,omitempty"`
}

type JSONTime time.Time

func (j *JSONTime) UnmarshalJSON(b []byte) error {
	var timestamp int64
	err := json.Unmarshal(b, &timestamp)
	if err != nil {
		return err
	}
	*j = JSONTime(time.Unix(timestamp, 0))
	return nil
}

// Time Optional: Add this if you need to convert back to time.Time
func (j JSONTime) Time() time.Time {
	return time.Time(j)
}
