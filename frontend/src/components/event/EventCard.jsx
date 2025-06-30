import React, { useState, useRef, useEffect } from "react";
import { Card, Typography, Button, Tag, Row, Col, Space } from "antd";

const { Title, Text } = Typography;

function getLocalTimeZoneAbbreviation(date = new Date()) {
  const options = { timeZoneName: "short" };
  const formatter = new Intl.DateTimeFormat(undefined, options);
  const parts = formatter.formatToParts(date);
  const zonePart = parts.find((part) => part.type === "timeZoneName");
  return zonePart?.value || "";
}

export default function EventCard({ event }) {
  const [showDescription, setShowDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [descHeight, setDescHeight] = useState("0px");

  useEffect(() => {
    if (descriptionRef.current) {
      setDescHeight(showDescription ? `${descriptionRef.current.scrollHeight}px` : "0px");
    }
  }, [showDescription]);

  const lat = event.location?.lat;
  const lng = event.location?.lng;
  const address = event.location?.address;
  const canRegister = Date.now() < new Date(event.start_time);

  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const localZone = getLocalTimeZoneAbbreviation(start);

  const isSameDate =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const formatDate = (date) =>
    date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  const handleDirect = () => {
    let url = "";
    if (lat && lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else if (address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    } else {
      alert("No location info available.");
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <Card
      className="mb-4 shadow-sm"
      style={{
        borderRadius: "16px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        padding: "16px"
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Poster */}
        <Col xs={24} md={6}>
          <img
            src={event.poster_data}
            alt="poster"
            style={{
              width: "100%",
              borderRadius: "12px",
              objectFit: "cover",
              maxHeight: "170px"
            }}
          />
        </Col>

        {/* Info Section */}
        <Col xs={24} md={18}>
          <Row justify="space-between" align="top">
            <Col span={18}>
              <Title level={4} className="mb-1" style={{ fontWeight: "700" }}>
                {event.name}
              </Title>

              {isSameDate ? (
                <>
                  <Text className="d-block" style={{ fontSize: "14px" }}>
                    {formatDate(start)}
                  </Text>
                  <Text className="d-block mb-2" style={{ fontSize: "14px" }}>
                    {formatTime(start)} – {formatTime(end)} ({localZone})
                  </Text>
                </>
              ) : (
                <>
                  <Text className="d-block" style={{ fontSize: "14px" }}>
                    <strong>Starts:</strong> {formatDate(start)} at {formatTime(start)} ({localZone})
                  </Text>
                  <Text className="d-block mb-2" style={{ fontSize: "14px" }}>
                    <strong>Ends:</strong> {formatDate(end)} at {formatTime(end)} ({localZone})
                  </Text>
                </>
              )}

              <Space direction="vertical" size={0} className="mb-2">
                <Text strong>{event.location?.place_name}</Text>
                <Text>{event.location?.address}</Text>
                <Text>Room {event.location?.room}</Text>
                <Tag
                  onClick={handleDirect}
                  color="#d9d9d9"
                  style={{
                    borderRadius: "20px",
                    padding: "2px 10px",
                    fontSize: "12px",
                    cursor: "pointer",
                    width: "fit-content"
                  }}
                >
                  📍 direct me
                </Tag>
                <br/>
                <Space>
                  {event.is_colloquium == 1 && <Tag color="purple">Colloquium</Tag>}
                  {event.on_campus == 1 && <Tag color="blue">On Campus</Tag>}
                </Space>
              </Space>

              {/* Slide-down Description */}
              <div
                ref={descriptionRef}
                style={{
                  overflow: "hidden",
                  maxHeight: descHeight,
                  transition: "max-height 0.3s ease",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginTop: "8px",
                  }}
                >
                  <strong>Description:</strong>
                  <br/>
                  {event.description}
                </Text>
              </div>
            </Col>

            {/* Register button */}
            <Col span={6} className="text-end">
              {canRegister && (
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#5890F1",
                    borderRadius: "20px",
                    padding: "4px 16px"
                  }}
                >
                  Register
                </Button>
              )}
            </Col>
          </Row>

          {/* Show More / Less Button - Bottom Right */}
          {event.description && (
            <Row justify="end" style={{ marginTop: 10 }}>
              <Button
                type="link"
                size="small"
                onClick={() => setShowDescription(!showDescription)}
                style={{ padding: 0 }}
              >
                {showDescription ? "Show less ▲" : "Show more ▼"}
              </Button>
            </Row>
          )}
        </Col>
      </Row>
    </Card>
  );
}
