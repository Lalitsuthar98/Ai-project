const API_URL = import.meta.env.VITE_API_URL;


// ==================================================
// SEND MESSAGE WITH STREAMING
// ==================================================

export const sendMessageStream = async ({
  content,
  chatId = null,
  model = null,
  regenerate = false,
  signal = null,
  onChunk,
  onDone,
  onError,
}) => {

  try {

    // ------------------------------------------------
    // BUILD URL
    // ------------------------------------------------

    const url = regenerate
      ? `${API_URL}/msg/${chatId}/regenerate`
      : chatId
        ? `${API_URL}/msg/${chatId}`
        : `${API_URL}/msg/`;
    // ------------------------------------------------
    // SEND REQUEST
    // ------------------------------------------------

    const response = await fetch(url, {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      signal,

      body: JSON.stringify({
        content,
        model,
        regenerate,
      }),
    });


    // ------------------------------------------------
    // CHECK RESPONSE
    // ------------------------------------------------

    if (!response.ok) {

      let errorMessage =
        "Failed to send message";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData?.message ||
          errorMessage;

      } catch {
        // Ignore JSON parsing error
      }

      throw new Error(errorMessage);
    }


    // ------------------------------------------------
    // CHECK STREAM
    // ------------------------------------------------

    if (!response.body) {

      throw new Error(
        "Streaming response is not supported by this browser"
      );
    }




    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";


    // =================================================
    // PROCESS SSE EVENT
    // =================================================

    const processEvent = (event) => {

      const line = event
        .split("\n")
        .find((line) =>
          line.startsWith("data:")
        );


      if (!line) {
        return;
      }


      const jsonString =
        line.slice(5).trim();


      if (!jsonString) {
        return;
      }


      try {

        const data =
          JSON.parse(jsonString);


        // --------------------------------------------
        // AI TEXT CHUNK
        // --------------------------------------------

        if (data.type === "chunk") {

  

          onChunk?.(
            data.content
          );
        }


        // --------------------------------------------
        // STREAM COMPLETE
        // --------------------------------------------

        else if (data.type === "done") {

        

          onDone?.(data);
        }


        // --------------------------------------------
        // STREAM ERROR
        // --------------------------------------------

        else if (data.type === "error") {

          console.error(
            "Backend stream error:",
            data.message
          );

          onError?.(
            new Error(
              data.message ||
              "AI response error"
            )
          );
        }

      } catch (error) {

        console.error(
          "Stream JSON parsing error:",
          error,
          event
        );
      }
    };


    // =================================================
    // READ STREAM
    // =================================================

    while (true) {

      const { value, done } =
        await reader.read();


      // ------------------------------------------------
      // STREAM FINISHED
      // ------------------------------------------------

      if (done) {

        // Process any remaining event
        if (buffer.trim()) {

          processEvent(buffer);
        }

        break;
      }


      // ------------------------------------------------
      // DECODE CHUNK
      // ------------------------------------------------

      buffer += decoder.decode(
        value,
        {
          stream: true,
        }
      );


      // ------------------------------------------------
      // SPLIT SSE EVENTS
      // ------------------------------------------------

      const events =
        buffer.split("\n\n");


      // Keep incomplete event
      buffer =
        events.pop() || "";


      // Process complete events
      for (const event of events) {

        processEvent(event);
      }
    }

  } catch (error) {

    // AbortController intentionally stopped request
    if (error?.name === "AbortError") {

      console.log(
        "AI generation stopped by user"
      );

      return;
    }


    console.error(
      "sendMessageStream error:",
      error
    );


    onError?.(error);
  }
};


// ==================================================
// GET CHAT MESSAGES
// ==================================================

export const getChatMessages = async (chatId) => {

  try {

    const response =
      await fetch(
        `${API_URL}/msg/${chatId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );


    if (!response.ok) {

      let errorMessage =
        "Failed to load chat";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData?.message ||
          errorMessage;

      } catch {}

      throw new Error(errorMessage);
    }


    return await response.json();

  } catch (error) {

    console.error(
      "getChatMessages error:",
      error
    );

    throw error;
  }
};


// ==================================================
// GET RECENT CHATS
// ==================================================

export const getRecentChats = async () => {

  try {

    const response =
      await fetch(
        `${API_URL}/chat/getRecentChat`,
        {
          method: "GET",
          credentials: "include",
        }
      );


    if (!response.ok) {

      let errorMessage =
        "Failed to load recent chats";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData?.message ||
          errorMessage;

      } catch {}

      throw new Error(errorMessage);
    }


    return await response.json();

  } catch (error) {

    console.error(
      "getRecentChats error:",
      error
    );

    throw error;
  }
};


// ==================================================
// DELETE CHAT
// ==================================================

export const deleteChat = async (chatId) => {

  try {

    const response =
      await fetch(
        `${API_URL}/chat/${chatId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


    if (!response.ok) {

      let errorMessage =
        "Failed to delete chat";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData?.message ||
          errorMessage;

      } catch {}

      throw new Error(errorMessage);
    }


    return await response.json();

  } catch (error) {

    console.error(
      "deleteChat error:",
      error
    );

    throw error;
  }
};