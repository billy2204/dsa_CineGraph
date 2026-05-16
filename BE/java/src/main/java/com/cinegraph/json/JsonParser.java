package com.cinegraph.json;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class JsonParser {
    private final String text;
    private int position;

    private JsonParser(String text) {
        this.text = text == null ? "" : text;
    }

    public static Object parse(String text) {
        JsonParser parser = new JsonParser(text);
        Object value = parser.readValue();
        parser.skipWhitespace();
        if (!parser.isAtEnd()) {
            throw parser.error("Unexpected trailing content");
        }
        return value;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String text) {
        Object value = parse(text);
        if (!(value instanceof Map<?, ?>)) {
            throw new IllegalArgumentException("JSON value is not an object");
        }
        return (Map<String, Object>) value;
    }

    private Object readValue() {
        skipWhitespace();
        if (isAtEnd()) {
            throw error("Unexpected end of JSON");
        }

        char current = peek();
        return switch (current) {
            case '{' -> readObject();
            case '[' -> readArray();
            case '"' -> readString();
            case 't' -> readLiteral("true", Boolean.TRUE);
            case 'f' -> readLiteral("false", Boolean.FALSE);
            case 'n' -> readLiteral("null", null);
            default -> {
                if (current == '-' || Character.isDigit(current)) {
                    yield readNumber();
                }
                throw error("Unexpected character '" + current + "'");
            }
        };
    }

    private Map<String, Object> readObject() {
        expect('{');
        Map<String, Object> object = new LinkedHashMap<>();
        skipWhitespace();
        if (tryRead('}')) {
            return object;
        }

        while (true) {
            skipWhitespace();
            String key = readString();
            skipWhitespace();
            expect(':');
            object.put(key, readValue());
            skipWhitespace();
            if (tryRead('}')) {
                return object;
            }
            expect(',');
        }
    }

    private List<Object> readArray() {
        expect('[');
        List<Object> array = new ArrayList<>();
        skipWhitespace();
        if (tryRead(']')) {
            return array;
        }

        while (true) {
            array.add(readValue());
            skipWhitespace();
            if (tryRead(']')) {
                return array;
            }
            expect(',');
        }
    }

    private String readString() {
        expect('"');
        StringBuilder builder = new StringBuilder();
        while (!isAtEnd()) {
            char current = text.charAt(position++);
            if (current == '"') {
                return builder.toString();
            }
            if (current != '\\') {
                builder.append(current);
                continue;
            }

            if (isAtEnd()) {
                throw error("Unterminated escape sequence");
            }
            char escaped = text.charAt(position++);
            switch (escaped) {
                case '"' -> builder.append('"');
                case '\\' -> builder.append('\\');
                case '/' -> builder.append('/');
                case 'b' -> builder.append('\b');
                case 'f' -> builder.append('\f');
                case 'n' -> builder.append('\n');
                case 'r' -> builder.append('\r');
                case 't' -> builder.append('\t');
                case 'u' -> builder.append(readUnicodeEscape());
                default -> throw error("Unsupported escape sequence \\" + escaped);
            }
        }
        throw error("Unterminated string");
    }

    private char readUnicodeEscape() {
        if (position + 4 > text.length()) {
            throw error("Invalid unicode escape");
        }
        String hex = text.substring(position, position + 4);
        position += 4;
        try {
            return (char) Integer.parseInt(hex, 16);
        } catch (NumberFormatException exception) {
            throw error("Invalid unicode escape: " + hex);
        }
    }

    private Object readNumber() {
        int start = position;
        if (peek() == '-') {
            position++;
        }
        readDigits();
        boolean floatingPoint = false;
        if (!isAtEnd() && peek() == '.') {
            floatingPoint = true;
            position++;
            readDigits();
        }
        if (!isAtEnd() && (peek() == 'e' || peek() == 'E')) {
            floatingPoint = true;
            position++;
            if (!isAtEnd() && (peek() == '+' || peek() == '-')) {
                position++;
            }
            readDigits();
        }

        String number = text.substring(start, position);
        try {
            return floatingPoint ? Double.parseDouble(number) : Long.parseLong(number);
        } catch (NumberFormatException exception) {
            return Double.parseDouble(number);
        }
    }

    private void readDigits() {
        int start = position;
        while (!isAtEnd() && Character.isDigit(peek())) {
            position++;
        }
        if (start == position) {
            throw error("Expected digit");
        }
    }

    private Object readLiteral(String literal, Object value) {
        if (!text.startsWith(literal, position)) {
            throw error("Expected " + literal);
        }
        position += literal.length();
        return value;
    }

    private void skipWhitespace() {
        while (!isAtEnd() && Character.isWhitespace(peek())) {
            position++;
        }
    }

    private boolean tryRead(char expected) {
        if (!isAtEnd() && peek() == expected) {
            position++;
            return true;
        }
        return false;
    }

    private void expect(char expected) {
        if (isAtEnd() || text.charAt(position) != expected) {
            throw error("Expected '" + expected + "'");
        }
        position++;
    }

    private char peek() {
        return text.charAt(position);
    }

    private boolean isAtEnd() {
        return position >= text.length();
    }

    private IllegalArgumentException error(String message) {
        return new IllegalArgumentException(message + " at position " + position);
    }
}
