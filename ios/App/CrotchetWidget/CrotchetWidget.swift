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
        var title: String? = nil
        var subtitle: String? = nil

        if(sharedDefaults != nil) {
            if(configuration.dataSource == nil) {
                title = sharedDefaults?.string(forKey: "dataSources" )
            }
            else {
                title = sharedDefaults?.string(forKey: configuration.dataSource! )
                subtitle = sharedDefaults?.string(forKey: configuration.dataSource! + "count" )
            }
        }

        let currentDate = Date()
        let entryDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let entry = SimpleEntry(date: entryDate, title: title, subtitle: subtitle, configuration: configuration)
        entries.append(entry)

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let title: String?
    let subtitle: String?
    let configuration: ConfigurationAppIntent
    
    init(date: Date, title: String? = nil, subtitle: String? = nil, configuration: ConfigurationAppIntent) {
        self.date = date
        self.title = title
        self.subtitle = subtitle
        self.configuration = configuration
    }
}

struct CrotchetWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack {
            Text(entry.title ?? "Not Set")
            if(entry.subtitle != nil) {
                Text(entry.subtitle!)
            }
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
