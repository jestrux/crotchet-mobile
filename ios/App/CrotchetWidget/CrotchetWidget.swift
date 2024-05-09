//
//  CrotchetWidget.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(),
                    configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []
        
        let sharedDefaults = UserDefaults.init(suiteName: "group.tz.co.crotchet")
        
        var image: String? = nil
        var video: String? = nil
        var title: String? = nil
        var subtitle: String? = nil
        var url: String? = nil

        if(sharedDefaults != nil) {
            if(configuration.dataSource != nil) {
                let sourceObject: String? = sharedDefaults?.string(forKey: configuration.dataSource!.id + configuration.view.id )
                
                if(sourceObject != nil) {
                    let jsonString = sourceObject!
                    let data = Data(jsonString.utf8)
                    do {
                       if let dictionary = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                           video = dictionary["video"] as? String
                           image = dictionary["image"] as? String
                           title = dictionary["title"] as? String
                           subtitle = dictionary["subtitle"] as? String
                           url = dictionary["url"] as? String
                       }
                    } catch let error as NSError {
                       print("Failed to load: \(error.localizedDescription)")
                    }
                }
            }
        }

        let currentDate = Date()
        let entryDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let entry = SimpleEntry(date: entryDate,
                                video: video,
                                image: image, title: title, subtitle: subtitle,
                                url: url,
                                configuration: configuration)
        entries.append(entry)

        return Timeline(entries: entries, policy: .never)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let image: String?
    let video: String?
    let title: String?
    let subtitle: String?
    let url: String?
    let configuration: ConfigurationAppIntent
    
    init(date: Date, video: String? = nil, image: String? = nil, title: String? = nil, subtitle: String? = nil, url: String? = nil, configuration: ConfigurationAppIntent) {
        self.date = date
        self.image = image ?? video
        self.video = video
        self.title = title
        self.subtitle = subtitle
        self.url = url
        self.configuration = configuration
    }
}

struct CrotchetWidgetEntryView : View {
    var entry: Provider.Entry
    
    @Environment(\.widgetFamily) var family
    
    @ViewBuilder
     func image() -> some View {
         let size = family == .systemMedium ? 90.0 : 60.0;
         
        if entry.image != nil {
            let image = URL(string: entry.image!)!;
            let source = entry.configuration.dataSource;
            let slug = source == nil ? "" : "search/" + source!.id;
            
            Link(destination: URL(string: entry.url ?? "crotchet://" + slug)!) {
                Group {
                    if let imageData = try? Data(contentsOf: image),
                   let uiImage = UIImage(data: imageData) {

                   Image(uiImage: uiImage)
                     .resizable()
                     .aspectRatio(contentMode: .fill)
                  }
                    else {
                        Rectangle()
                            .size(width: size, height: size)
                            .background(Color.gray)
                    }
                }
                .frame(width: size, height: size)
                .cornerRadius(10)
            }
        } else {
                EmptyView()
        }
    }

    var body: some View {
        let small = family == .systemSmall
        let medium = family == .systemMedium
        let hasData = entry.title != nil;
        
        HStack(alignment: .top) {
            if(medium) {
                image()
                    .padding(.trailing)
            }
            
            VStack(alignment: .leading) {
                if(small) {
                    image()
                }
                
                if(entry.configuration.dataSource != nil) {
                    Text(entry.configuration.dataSource!.id)
                        .font(.footnote)
                        .bold()
                        .padding(.top, 2)
                        .padding(.bottom, -2)
                }
                
                Text(entry.title ?? "Not Set")
                    .font(.subheadline)
                
                if(entry.subtitle != nil) {
                    Text(entry.subtitle!)
                        .font(.caption2)
                        .padding(.top, -8)
                }
            }
            
            if(medium && hasData) {
                Spacer()
            }
        }
        
        if(hasData) {
            Spacer()
        }
    }
}

struct CrotchetWidget: Widget {
    let kind: String = "CrotchetWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            CrotchetWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}


#Preview(as: .systemSmall) {
    CrotchetWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: ConfigurationAppIntent())
}
