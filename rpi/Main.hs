{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

import Control.Monad.Trans (liftIO)
import Data.Aeson (ToJSON, (.=), object)
import Database.SQLite.Simple
import Database.SQLite.Simple.FromRow
import GHC.Generics
import Network.HTTP.Types.Status (ok200, notImplemented501, unauthorized401)
import System.Directory
import Web.Scotty

data Settings = Settings {
  name :: String,
  upper :: Int,
  lower :: Int,
  interval :: Int
} deriving (Show, Generic)

instance ToJSON Settings
instance FromRow Settings where
  fromRow = Settings <$> field <*> field <*> field <*> field

data Event = Event {
  eventId :: Int,
  eventType :: String,
  eventTimestamp :: Int
} deriving (Show, Generic)

instance ToJSON Event
instance FromRow Event where
  fromRow = Event <$> field <*> field <*> field

data Measurement = Measurement {
  measurementId :: Int,
  measurementValue :: Int,
  measurementTimestamp :: Int
} deriving (Show, Generic)

instance ToJSON Measurement
instance FromRow Measurement where
  fromRow = Measurement <$> field <*> field <*> field

data History = History {
  events :: [Event],
  measurements :: [Measurement]
} deriving (Show, Generic)

instance ToJSON History

getPassword :: IO String
getPassword = do
  val <- readFile "rpi.cfg"
  return $ filter (/= '\n') val

main = scotty 3000 $ do

  get "/settings" $ do
    -- TODO: Check JWT validity
    conn <- liftIO (open "happyflowers.db")
    rows <- liftIO (query_ conn "SELECT * FROM settings" :: IO [Settings])
    json (head rows)
    liftIO (close conn)

  put "/settings" $ do
    -- TODO: Check JWT validity
    status notImplemented501

  get "/history" $ do
    conn <- liftIO (open "happyflowers.db")
    events <- liftIO (query_ conn "SELECT * FROM events WHERE date(timestamp) >= date('now', '-14 days')" :: IO [Event])
    measurements <- liftIO (query_ conn "SELECT * FROM measurements WHERE date(timestamp) >= date('now', '-14 days')" :: IO [Measurement])
    json History { events = events, measurements = measurements }
    liftIO (close conn)

  post "/auth" $ do
    pw <- param "password"
    syspw <- liftIO getPassword
    if pw == syspw then status ok200 else status unauthorized401
    -- TODO: Send JWT if pw == syspw
